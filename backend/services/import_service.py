import csv
import io
import json
import logging
from decimal import Decimal, InvalidOperation

from models.product import ProductIn
from repositories.products import create_product
from services.embedding import embed_many
from services.llm import chat

_CANONICAL_FIELDS = ["name", "category", "price", "quantity", "description", "specs"]
_EMBED_BATCH_SIZE = 100

logger = logging.getLogger(__name__)


async def preview(file_bytes: bytes) -> dict:
    """Parse CSV and use LLM to suggest column mapping to canonical product fields."""
    text = file_bytes.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    columns = reader.fieldnames or []
    all_rows: list[dict] = []
    for row in reader:
        all_rows.append(dict(row))
    sample_rows = all_rows[:5]

    # Build LLM prompt for column mapping
    columns_list = ", ".join(f'"{c}"' for c in columns)
    sample_preview = ""
    if sample_rows:
        sample_preview = f"\nSample data (first row): {json.dumps(sample_rows[0], ensure_ascii=False)}"

    messages = [
        {
            "role": "system",
            "content": (
                "You are a data mapping assistant. "
                "Respond ONLY with valid JSON, no explanation."
            ),
        },
        {
            "role": "user",
            "content": (
                f"I have a CSV with these columns: {columns_list}.{sample_preview}\n\n"
                f"Map each of these canonical product fields to the best matching CSV column "
                f"(or null if no match): {', '.join(_CANONICAL_FIELDS)}.\n\n"
                f"Respond with a JSON object like: "
                f'{{"name": "csv_col", "category": null, "price": "csv_col", ...}}'
            ),
        },
    ]

    suggested_mapping: dict = {}
    try:
        raw = await chat(messages)
        # Strip markdown code fences if present
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```", 2)[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.strip()
        suggested_mapping = json.loads(cleaned)
        # Keep only known canonical keys
        suggested_mapping = {
            k: v for k, v in suggested_mapping.items() if k in _CANONICAL_FIELDS
        }
    except Exception as exc:
        logger.warning("LLM column mapping failed: %s", exc)
        suggested_mapping = {}

    return {
        "columns": list(columns),
        "sample_rows": sample_rows,   # first 5 rows for UI preview display
        "rows": all_rows,             # all rows echoed back for commit
        "suggested_mapping": suggested_mapping,
    }


def _get_str(row: dict, mapping: dict, field: str) -> str | None:
    col = mapping.get(field)
    if col and row.get(col):
        val = str(row[col]).strip()
        return val if val else None
    return None


def _parse_price(raw: str) -> Decimal | None:
    """Parse price strings including Brazilian format (R$ 1.234,56)."""
    try:
        s = raw.replace("R$", "").replace(" ", "").strip()
        if "," in s and "." in s:
            # Dot is thousands separator, comma is decimal
            s = s.replace(".", "").replace(",", ".")
        elif "," in s:
            s = s.replace(",", ".")
        return Decimal(s)
    except (InvalidOperation, ValueError):
        return None


async def commit(
    rows: list[dict],
    mapping: dict[str, str | None],
    business_phone: str,
    pool,
) -> dict:
    """Import rows into products table using the confirmed column mapping."""
    imported = 0
    skipped = 0
    errors: list[str] = []

    products_to_insert: list[ProductIn] = []
    row_indices: list[int] = []

    for idx, row in enumerate(rows):
        name_col = mapping.get("name")
        name = (row.get(name_col) or "").strip() if name_col else ""
        if not name:
            skipped += 1
            continue

        price_col = mapping.get("price")
        price = _parse_price(str(row[price_col])) if price_col and row.get(price_col) else None

        qty_col = mapping.get("quantity")
        quantity = 0
        if qty_col and row.get(qty_col):
            try:
                quantity = int(str(row[qty_col]).strip())
            except (ValueError, TypeError):
                quantity = 0

        products_to_insert.append(ProductIn(
            name=name,
            category=_get_str(row, mapping, "category"),
            price=price,
            quantity=quantity,
            description=_get_str(row, mapping, "description"),
            specs=_get_str(row, mapping, "specs"),
        ))
        row_indices.append(idx)

    if not products_to_insert:
        return {"imported": 0, "skipped": skipped, "errors": errors}

    # Batch embed in chunks to respect API limits
    embed_texts = [
        " ".join(filter(None, [p.name, p.category, p.description, p.specs]))
        for p in products_to_insert
    ]
    embeddings: list[list[float]] = []
    for i in range(0, len(embed_texts), _EMBED_BATCH_SIZE):
        chunk = embed_texts[i : i + _EMBED_BATCH_SIZE]
        try:
            embeddings.extend(await embed_many(chunk))
        except Exception as e:
            return {
                "imported": imported,
                "skipped": skipped,
                "errors": errors + [f"Embedding batch failed at row {row_indices[i] + 1}: {e}"],
            }

    for product, embedding, row_idx in zip(products_to_insert, embeddings, row_indices):
        try:
            await create_product(pool, business_phone, product, embedding)
            imported += 1
        except Exception as e:
            errors.append(f"Row {row_idx + 1} ({product.name!r}): {e}")

    return {"imported": imported, "skipped": skipped, "errors": errors}
