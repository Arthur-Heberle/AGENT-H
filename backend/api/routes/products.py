import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from categories import DEFAULT_CATEGORIES
from core.deps import require_auth, get_db
from models.import_models import ImportCommitIn
from models.product import ProductIn, ProductOut
from repositories.products import (
    get_custom_categories,
    list_products,
    set_product_image,
    soft_delete_product,
)
from services import import_service
from services.product_service import create_product, update_product

_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads")
_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB

router = APIRouter()


@router.get("/products", response_model=list[ProductOut])
async def get_products(
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    return await list_products(pool, business_phone)


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def add_product(
    data: ProductIn,
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    return await create_product(pool, business_phone, data)


@router.post("/products/import/preview")
async def import_preview(
    file: UploadFile,
    business_phone: str = Depends(require_auth),
):
    is_csv = (file.content_type or "").lower() in ("text/csv", "application/csv") or (
        file.filename or ""
    ).lower().endswith(".csv")
    if not is_csv:
        raise HTTPException(status_code=400, detail="File must be a CSV")
    file_bytes = await file.read()
    return await import_service.preview(file_bytes)


@router.post("/products/import/commit")
async def import_commit(
    data: ImportCommitIn,
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    return await import_service.commit(data.rows, data.mapping, business_phone, pool)


@router.put("/products/{product_id}", response_model=ProductOut)
async def edit_product(
    product_id: int,
    data: ProductIn,
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    result = await update_product(pool, product_id, business_phone, data)
    if result is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return result


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    ok = await soft_delete_product(pool, product_id, business_phone)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True}


@router.post("/products/{product_id}/image")
async def upload_product_image(
    product_id: int,
    file: UploadFile,
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    data = await file.read()
    if len(data) > _MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be ≤ 5 MB")
    ext = (file.filename or "img").rsplit(".", 1)[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "gif", "webp"):
        ext = "jpg"
    folder = os.path.join(_UPLOAD_DIR, business_phone)
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, f"{product_id}.{ext}")
    with open(path, "wb") as f:
        f.write(data)
    url = f"/static/uploads/{business_phone}/{product_id}.{ext}"
    ok = await set_product_image(pool, product_id, business_phone, url)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"image_url": url}


@router.delete("/products/{product_id}/image")
async def delete_product_image(
    product_id: int,
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    ok = await set_product_image(pool, product_id, business_phone, None)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True}


@router.get("/categories", response_model=list[str])
async def get_categories(
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    custom = await get_custom_categories(pool, business_phone)
    merged = list(dict.fromkeys(DEFAULT_CATEGORIES + custom))
    return merged
