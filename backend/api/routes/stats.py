from fastapi import APIRouter, Depends

from core.deps import get_business_phone, get_db
from models.stats import StatsOut
from services.stats_service import get_stats

router = APIRouter()


@router.get("/stats", response_model=StatsOut)
async def stats(
    pool=Depends(get_db),
    business_phone: str = Depends(get_business_phone),
):
    return await get_stats(pool, business_phone)
