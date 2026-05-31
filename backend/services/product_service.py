from asyncpg import Pool

from models.product import ProductIn, ProductOut
from repositories import products as product_repo
from services.embedding import embed


def _embed_text(data: ProductIn) -> str:
    parts = [data.name, data.category, data.description, data.specs]
    return ". ".join(p for p in parts if p)


def _needs_reembed(old: dict, new: ProductIn) -> bool:
    return (
        old["name"] != new.name
        or old["category"] != new.category
        or old["description"] != new.description
        or old["specs"] != new.specs
    )


async def create_product(pool: Pool, business_phone: str, data: ProductIn) -> ProductOut:
    vector = await embed(_embed_text(data))
    return await product_repo.create_product(pool, business_phone, data, vector)


async def update_product(
    pool: Pool,
    product_id: int,
    business_phone: str,
    data: ProductIn,
) -> ProductOut | None:
    old = await product_repo.get_product(pool, product_id, business_phone)
    if old is None:
        return None
    vector = await embed(_embed_text(data)) if _needs_reembed(old, data) else None
    return await product_repo.update_product(pool, product_id, business_phone, data, vector)
