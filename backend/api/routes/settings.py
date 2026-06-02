from fastapi import APIRouter, Depends, Response

from core.deps import get_db, require_auth
from models.settings import ProfileIn, ProfileOut, SettingsIn, SettingsOut
from repositories import settings as repo

router = APIRouter()


@router.get("/profile", response_model=ProfileOut)
async def get_profile(pool=Depends(get_db), phone: str = Depends(require_auth)):
    return await repo.get_profile(pool, phone)


@router.put("/profile", response_model=ProfileOut)
async def update_profile(data: ProfileIn, pool=Depends(get_db), phone: str = Depends(require_auth)):
    return await repo.update_profile(pool, phone, data)


@router.delete("/account", status_code=204)
async def delete_account(pool=Depends(get_db), phone: str = Depends(require_auth)):
    await repo.delete_account(pool, phone)
    return Response(status_code=204)


@router.get("/settings", response_model=SettingsOut)
async def get_settings(pool=Depends(get_db), phone: str = Depends(require_auth)):
    return await repo.get_settings(pool, phone)


@router.put("/settings", response_model=SettingsOut)
async def update_settings(data: SettingsIn, pool=Depends(get_db), phone: str = Depends(require_auth)):
    return await repo.upsert_settings(pool, phone, data)
