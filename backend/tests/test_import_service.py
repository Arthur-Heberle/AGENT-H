import json
import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, patch, MagicMock

from services.import_service import preview, commit, _parse_price, _get_str


# ---------------------------------------------------------------------------
# _parse_price — pure sync helper
# ---------------------------------------------------------------------------

def test_parse_price_plain_decimal():
    assert _parse_price("1990.00") == Decimal("1990.00")


def test_parse_price_brazilian_format():
    # R$ 1.234,56 — dot is thousands sep, comma is decimal
    assert _parse_price("R$ 1.234,56") == Decimal("1234.56")


def test_parse_price_comma_decimal():
    # 1234,50 — comma is decimal separator
    assert _parse_price("1234,50") == Decimal("1234.50")


def test_parse_price_invalid_returns_none():
    assert _parse_price("not-a-price") is None


def test_parse_price_empty_string_returns_none():
    assert _parse_price("") is None


# ---------------------------------------------------------------------------
# _get_str — pure sync helper
# ---------------------------------------------------------------------------

def test_get_str_returns_mapped_value():
    row = {"Nome": "Sofá Rubi", "Preço": "1990"}
    mapping = {"name": "Nome", "price": "Preço"}
    assert _get_str(row, mapping, "name") == "Sofá Rubi"


def test_get_str_missing_field_in_mapping_returns_none():
    row = {"Nome": "Sofá Rubi"}
    mapping = {"name": "Nome"}
    assert _get_str(row, mapping, "category") is None


def test_get_str_empty_cell_returns_none():
    row = {"Nome": ""}
    mapping = {"name": "Nome"}
    assert _get_str(row, mapping, "name") is None


def test_get_str_whitespace_only_returns_none():
    row = {"Nome": "   "}
    mapping = {"name": "Nome"}
    assert _get_str(row, mapping, "name") is None


def test_get_str_strips_whitespace():
    row = {"Nome": "  Sofá  "}
    mapping = {"name": "Nome"}
    assert _get_str(row, mapping, "name") == "Sofá"


# ---------------------------------------------------------------------------
# preview() — async
# ---------------------------------------------------------------------------

CSV_HEADER = "nome,categoria,preco,quantidade,descricao\n"
CSV_ROWS = (
    "Sofá Rubi,Sofás,1990.00,5,Sofá confortável\n"
    "Mesa Centro,Mesas,599.90,3,Mesa de centro\n"
    "Cadeira Azul,Cadeiras,299.00,10,Cadeira ergonômica\n"
    "Estante Branca,Estantes,899.50,2,Estante de madeira\n"
    "Rack TV,Racks,450.00,7,Rack para televisão\n"
    "Extra Row,Extras,100.00,1,Should not appear in sample\n"  # 6th row — capped at 5
)
CSV_BYTES = (CSV_HEADER + CSV_ROWS).encode("utf-8")

FAKE_LLM_MAPPING = {
    "name": "nome",
    "category": "categoria",
    "price": "preco",
    "quantity": "quantidade",
    "description": "descricao",
    "specs": None,
}


@pytest.mark.anyio
async def test_preview_columns_extracted():
    with patch("services.import_service.chat", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = json.dumps(FAKE_LLM_MAPPING)
        result = await preview(CSV_BYTES)

    assert result["columns"] == ["nome", "categoria", "preco", "quantidade", "descricao"]


@pytest.mark.anyio
async def test_preview_sample_rows_capped_at_five():
    with patch("services.import_service.chat", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = json.dumps(FAKE_LLM_MAPPING)
        result = await preview(CSV_BYTES)

    assert len(result["sample_rows"]) == 5
    # Ensure the 6th row is excluded
    names = [r["nome"] for r in result["sample_rows"]]
    assert "Extra Row" not in names


@pytest.mark.anyio
async def test_preview_suggested_mapping_shape():
    with patch("services.import_service.chat", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = json.dumps(FAKE_LLM_MAPPING)
        result = await preview(CSV_BYTES)

    mapping = result["suggested_mapping"]
    assert mapping["name"] == "nome"
    assert mapping["price"] == "preco"
    assert mapping["specs"] is None


@pytest.mark.anyio
async def test_preview_strips_unknown_llm_keys():
    """LLM response may include keys not in _CANONICAL_FIELDS — they must be filtered out."""
    dirty_mapping = {**FAKE_LLM_MAPPING, "unknown_field": "some_col"}
    with patch("services.import_service.chat", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = json.dumps(dirty_mapping)
        result = await preview(CSV_BYTES)

    assert "unknown_field" not in result["suggested_mapping"]


@pytest.mark.anyio
async def test_preview_llm_failure_falls_back_to_empty_mapping():
    with patch("services.import_service.chat", new_callable=AsyncMock) as mock_chat:
        mock_chat.side_effect = RuntimeError("LLM unavailable")
        result = await preview(CSV_BYTES)

    assert result["suggested_mapping"] == {}
    # Columns and sample_rows must still be populated
    assert result["columns"] == ["nome", "categoria", "preco", "quantidade", "descricao"]
    assert len(result["sample_rows"]) == 5


@pytest.mark.anyio
async def test_preview_handles_markdown_fenced_json():
    fenced = "```json\n" + json.dumps(FAKE_LLM_MAPPING) + "\n```"
    with patch("services.import_service.chat", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = fenced
        result = await preview(CSV_BYTES)

    assert result["suggested_mapping"]["name"] == "nome"


# ---------------------------------------------------------------------------
# commit() — async
# ---------------------------------------------------------------------------

MAPPING = {
    "name": "nome",
    "category": "categoria",
    "price": "preco",
    "quantity": "quantidade",
    "description": "descricao",
    "specs": None,
}

ROWS = [
    {"nome": "Sofá Rubi", "categoria": "Sofás", "preco": "1990.00", "quantidade": "5", "descricao": "Sofá confortável"},
    {"nome": "Mesa Centro", "categoria": "Mesas", "preco": "R$ 1.234,56", "quantidade": "abc", "descricao": "Mesa"},
    {"nome": "", "categoria": "Ignorado", "preco": "100.00", "quantidade": "1", "descricao": "Sem nome"},  # skip
    {"nome": "Cadeira", "categoria": "Cadeiras", "preco": "not-a-price", "quantidade": "3", "descricao": ""},
]

FAKE_EMBEDDING = [[0.1] * 1536]


@pytest.mark.anyio
async def test_commit_basic_import():
    pool = MagicMock()

    with (
        patch("services.import_service.embed_many", new_callable=AsyncMock) as mock_embed,
        patch("services.import_service.create_product", new_callable=AsyncMock) as mock_create,
    ):
        mock_embed.return_value = FAKE_EMBEDDING * 3  # 3 valid rows
        mock_create.return_value = None

        result = await commit(ROWS, MAPPING, "+5511999999999", pool)

    assert result["imported"] == 3
    assert result["skipped"] == 1
    assert result["errors"] == []


@pytest.mark.anyio
async def test_commit_skips_rows_without_name():
    rows = [
        {"nome": "", "categoria": "X", "preco": "10", "quantidade": "1", "descricao": ""},
        {"nome": "   ", "categoria": "X", "preco": "10", "quantidade": "1", "descricao": ""},
    ]
    pool = MagicMock()

    with (
        patch("services.import_service.embed_many", new_callable=AsyncMock) as mock_embed,
        patch("services.import_service.create_product", new_callable=AsyncMock) as mock_create,
    ):
        result = await commit(rows, MAPPING, "+5511999999999", pool)

    assert result["imported"] == 0
    assert result["skipped"] == 2
    mock_embed.assert_not_called()
    mock_create.assert_not_called()


@pytest.mark.anyio
async def test_commit_price_parsing_variants():
    """Verify prices are parsed correctly for different format variants."""
    rows = [
        {"nome": "A", "preco": "1990.00", "quantidade": "1", "categoria": "", "descricao": ""},
        {"nome": "B", "preco": "R$ 1.234,56", "quantidade": "1", "categoria": "", "descricao": ""},
        {"nome": "C", "preco": "1234,50", "quantidade": "1", "categoria": "", "descricao": ""},
        {"nome": "D", "preco": "invalid", "quantidade": "1", "categoria": "", "descricao": ""},
    ]
    pool = MagicMock()
    captured_products = []

    async def capture_create(p, business_phone, product, embedding):
        captured_products.append(product)

    with (
        patch("services.import_service.embed_many", new_callable=AsyncMock) as mock_embed,
        patch("services.import_service.create_product", new_callable=AsyncMock, side_effect=capture_create),
    ):
        mock_embed.return_value = [[0.1] * 1536] * 4
        result = await commit(rows, MAPPING, "+5511999999999", pool)

    assert result["imported"] == 4
    assert captured_products[0].price == Decimal("1990.00")
    assert captured_products[1].price == Decimal("1234.56")
    assert captured_products[2].price == Decimal("1234.50")
    assert captured_products[3].price is None


@pytest.mark.anyio
async def test_commit_quantity_parsing():
    """Valid int parses; non-numeric defaults to 0."""
    rows = [
        {"nome": "A", "preco": "10", "quantidade": "7", "categoria": "", "descricao": ""},
        {"nome": "B", "preco": "10", "quantidade": "abc", "categoria": "", "descricao": ""},
    ]
    pool = MagicMock()
    captured_products = []

    async def capture_create(p, business_phone, product, embedding):
        captured_products.append(product)

    with (
        patch("services.import_service.embed_many", new_callable=AsyncMock) as mock_embed,
        patch("services.import_service.create_product", new_callable=AsyncMock, side_effect=capture_create),
    ):
        mock_embed.return_value = [[0.1] * 1536] * 2
        await commit(rows, MAPPING, "+5511999999999", pool)

    assert captured_products[0].quantity == 7
    assert captured_products[1].quantity == 0


@pytest.mark.anyio
async def test_commit_returns_errors_on_create_failure():
    rows = [
        {"nome": "Sofá Rubi", "preco": "100", "quantidade": "1", "categoria": "Sofás", "descricao": ""},
    ]
    pool = MagicMock()

    with (
        patch("services.import_service.embed_many", new_callable=AsyncMock) as mock_embed,
        patch("services.import_service.create_product", new_callable=AsyncMock) as mock_create,
    ):
        mock_embed.return_value = [[0.1] * 1536]
        mock_create.side_effect = Exception("DB error")
        result = await commit(rows, MAPPING, "+5511999999999", pool)

    assert result["imported"] == 0
    assert len(result["errors"]) == 1
    assert "Sofá Rubi" in result["errors"][0]


@pytest.mark.anyio
async def test_commit_embed_failure_returns_early():
    rows = [
        {"nome": "Sofá Rubi", "preco": "100", "quantidade": "1", "categoria": "Sofás", "descricao": ""},
    ]
    pool = MagicMock()

    with (
        patch("services.import_service.embed_many", new_callable=AsyncMock) as mock_embed,
        patch("services.import_service.create_product", new_callable=AsyncMock) as mock_create,
    ):
        mock_embed.side_effect = Exception("Embedding API down")
        result = await commit(rows, MAPPING, "+5511999999999", pool)

    assert result["imported"] == 0
    assert any("Embedding batch failed" in e for e in result["errors"])
    mock_create.assert_not_called()
