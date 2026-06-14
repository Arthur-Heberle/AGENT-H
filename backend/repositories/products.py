from asyncpg import Pool

from models.product import ProductIn, ProductOut


async def list_products(pool: Pool, business_phone: str) -> list[ProductOut]:
    rows = await pool.fetch(
        """
        SELECT id, name, category, price, quantity, description, specs, active, image_url, updated_at
        FROM products
        WHERE business_phone = $1
        ORDER BY active DESC, updated_at DESC
        """,
        business_phone,
    )
    return [ProductOut(**dict(r)) for r in rows]


async def get_product(pool: Pool, product_id: int, business_phone: str) -> dict | None:
    row = await pool.fetchrow(
        """
        SELECT id, name, category, price, quantity, description, specs, active, image_url, updated_at
        FROM products
        WHERE id = $1 AND business_phone = $2
        """,
        product_id,
        business_phone,
    )
    return dict(row) if row else None


async def set_product_image(
    pool: Pool, product_id: int, business_phone: str, url: str | None
) -> bool:
    result = await pool.execute(
        "UPDATE products SET image_url=$3, updated_at=NOW() WHERE id=$1 AND business_phone=$2",
        product_id,
        business_phone,
        url,
    )
    return result == "UPDATE 1"


async def create_product(
    pool: Pool,
    business_phone: str,
    data: ProductIn,
    embedding: list[float],
) -> ProductOut:
    row = await pool.fetchrow(
        """
        INSERT INTO products (business_phone, name, category, price, quantity, description, specs, embedding)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, category, price, quantity, description, specs, active, image_url, updated_at
        """,
        business_phone,
        data.name,
        data.category,
        data.price,
        data.quantity,
        data.description,
        data.specs,
        embedding,
    )
    return ProductOut(**dict(row))


async def update_product(
    pool: Pool,
    product_id: int,
    business_phone: str,
    data: ProductIn,
    embedding: list[float] | None,
) -> ProductOut | None:
    if embedding is not None:
        row = await pool.fetchrow(
            """
            UPDATE products
            SET name=$3, category=$4, price=$5, quantity=$6, description=$7, specs=$8,
                embedding=$9, updated_at=NOW()
            WHERE id=$1 AND business_phone=$2
            RETURNING id, name, category, price, quantity, description, specs, active, image_url, updated_at
            """,
            product_id,
            business_phone,
            data.name,
            data.category,
            data.price,
            data.quantity,
            data.description,
            data.specs,
            embedding,
        )
    else:
        row = await pool.fetchrow(
            """
            UPDATE products
            SET name=$3, category=$4, price=$5, quantity=$6, description=$7, specs=$8,
                updated_at=NOW()
            WHERE id=$1 AND business_phone=$2
            RETURNING id, name, category, price, quantity, description, specs, active, image_url, updated_at
            """,
            product_id,
            business_phone,
            data.name,
            data.category,
            data.price,
            data.quantity,
            data.description,
            data.specs,
        )
    return ProductOut(**dict(row)) if row else None


async def soft_delete_product(pool: Pool, product_id: int, business_phone: str) -> bool:
    result = await pool.execute(
        "UPDATE products SET active=false, updated_at=NOW() WHERE id=$1 AND business_phone=$2",
        product_id,
        business_phone,
    )
    return result == "UPDATE 1"


async def similarity_search(
    pool: Pool,
    business_phone: str,
    embedding: list[float],
    limit: int = 8,
) -> list[dict]:
    rows = await pool.fetch(
        """
        SELECT name, category, price, quantity, description, specs,
               1 - (embedding <=> $1) AS similarity
        FROM products
        WHERE business_phone = $2 AND active = true
        ORDER BY embedding <=> $1
        LIMIT $3
        """,
        embedding,
        business_phone,
        limit,
    )
    return [dict(r) for r in rows]


async def get_active_product_names(pool: Pool, business_phone: str) -> set[str]:
    """Return normalized (stripped + lowercased) names of active products, for import dedupe."""
    rows = await pool.fetch(
        "SELECT name FROM products WHERE business_phone = $1 AND active = true",
        business_phone,
    )
    return {r["name"].strip().lower() for r in rows if r["name"]}


async def get_custom_categories(pool: Pool, business_phone: str) -> list[str]:
    rows = await pool.fetch(
        """
        SELECT DISTINCT category FROM products
        WHERE business_phone = $1 AND category IS NOT NULL
        ORDER BY category
        """,
        business_phone,
    )
    return [r["category"] for r in rows]
