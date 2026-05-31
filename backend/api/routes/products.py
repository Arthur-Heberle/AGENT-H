from fastapi import APIRouter, Depends, HTTPException, status

from categories import DEFAULT_CATEGORIES
from core.deps import get_business_phone, get_db
from models.product import ProductIn, ProductOut
from repositories.products import (
    get_custom_categories,
    list_products,
    soft_delete_product,
)
from services.product_service import create_product, update_product

router = APIRouter()


@router.get("/products", response_model=list[ProductOut])
async def get_products(
    pool=Depends(get_db),
    business_phone: str = Depends(get_business_phone),
):
    return await list_products(pool, business_phone)


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def add_product(
    data: ProductIn,
    pool=Depends(get_db),
    business_phone: str = Depends(get_business_phone),
):
    return await create_product(pool, business_phone, data)


@router.put("/products/{product_id}", response_model=ProductOut)
async def edit_product(
    product_id: int,
    data: ProductIn,
    pool=Depends(get_db),
    business_phone: str = Depends(get_business_phone),
):
    result = await update_product(pool, product_id, business_phone, data)
    if result is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return result


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    pool=Depends(get_db),
    business_phone: str = Depends(get_business_phone),
):
    ok = await soft_delete_product(pool, product_id, business_phone)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True}


@router.get("/categories", response_model=list[str])
async def get_categories(
    pool=Depends(get_db),
    business_phone: str = Depends(get_business_phone),
):
    custom = await get_custom_categories(pool, business_phone)
    merged = list(dict.fromkeys(DEFAULT_CATEGORIES + custom))
    return merged
