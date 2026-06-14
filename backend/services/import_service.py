import csv
import io
import json
from decimal import Decimal, InvalidOperation

from models.product import ProductIn
from repositories.products import create_product
from services.embedding import embed_many
from services.llm import chat

_CANONICAL_FIELDS = ["name", "category", "price", "quantity", "description", "specs"]


async def preview(file_bytes: bytes) -> dict:
    """Parse CSV and use LLM to suggest column mapping to canonical product fields."""
    text = file_bytes.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    columns = reader.fieldnames or []
    sample_rows: list[dict] = []
    for row in reader:
        sample_rows.append(dict(row))
        if len(sample_rows) >= 5:
            break

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
    except Exception:
        suggested_mapping = {}

    return {
        "columns": list(columns),
        "sample_rows": sample_rows,
        "suggested_mapping": suggested_mapping,
    }


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

    # Build ProductIn objects and collect embed texts
    products_to_insert: list[ProductIn] = []
    row_indices: list[int] = []

    for idx, row in enumerate(rows):
        name_col = mapping.get("name")
        name = (row.get(name_col) or "").strip() if name_col else ""
        if not name:
            skipped += 1
            continue

        # Parse price
        price = None
        price_col = mapping.get("price")
        if price_col and row.get(price_col):
            try:
                # Remove common currency symbols and whitespace
                raw_price = str(row[price_col]).replace("R$", "").replace(",", ".").strip()
                price = Decimal(raw_price)
            except (InvalidOperation, ValueError):
                price = None

        # Parse quantity
        quantity = 0
        qty_col = mapping.get("quantity")
        if qty_col and row.get(qty_col):
            try:
                quantity = int(str(row[qty_col]).strip())
            except (ValueError, TypeError):
                quantity = 0

        # Parse string fields
        def get_str(field: str) -> str | None:
            col = mapping.get(field)
            if col and row.get(col):
                val = str(row[col]).strip()
                return val if val else None
            return None

        product = ProductIn(
            name=name,
            category=get_str("category"),
            price=price,
            quantity=quantity,
            description=get_str("description"),
            specs=get_str("specs"),
        )
        products_to_insert.append(product)
        row_indices.append(idx)

    if not products_to_insert:
        return {"imported": 0, "skipped": skipped, "errors": errors}

    # Batch embed all products at once
    embed_texts = [
        " ".join(
            filter(None, [p.name, p.category, p.description, p.specs])
        )
        for p in products_to_insert
    ]

    try:
        embeddings = await embed_many(embed_texts)
    except Exception as e:
        return {
            "imported": 0,
            "skipped": skipped,
            "errors": [f"Embedding batch failed: {e}"],
        }

    # Insert each product
    for product, embedding, row_idx in zip(products_to_insert, embeddings, row_indices):
        try:
            await create_product(pool, business_phone, product, embedding)
            imported += 1
        except Exception as e:
            errors.append(f"Row {row_idx + 1} ({product.name!r}): {e}")

    return {"imported": imported, "skipped": skipped, "errors": errors}
