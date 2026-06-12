from fastapi import APIRouter, Depends

from core.deps import require_auth, get_db
from models.stats import StatsOut
from services.stats_service import get_stats

router = APIRouter()


@router.get("/stats", response_model=StatsOut)
async def stats(
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    return await get_stats(pool, business_phone)
