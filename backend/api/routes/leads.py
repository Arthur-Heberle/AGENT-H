import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from core.deps import require_auth, get_db
from models.lead import LeadOut, LeadStatusIn
from repositories.leads import list_leads, update_status

router = APIRouter()

_VALID_STATUSES = {"new", "contacted", "won", "lost"}


@router.get("/leads", response_model=list[LeadOut])
async def get_leads(
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    return await list_leads(pool, business_phone)


@router.put("/leads/{customer_phone}")
async def set_lead_status(
    customer_phone: str,
    body: LeadStatusIn,
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    if body.status not in _VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"status must be one of {sorted(_VALID_STATUSES)}")
    ok = await update_status(pool, business_phone, customer_phone, body.status)
    if not ok:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True}


def _csv_safe(v: str) -> str:
    """Prevent formula injection when the cell value starts with a formula trigger character."""
    if v and v[0] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + v
    return v


@router.get("/leads/export.csv")
async def export_leads_csv(
    pool=Depends(get_db),
    business_phone: str = Depends(require_auth),
):
    leads = await list_leads(pool, business_phone)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["customer_phone", "customer_name", "summary", "status", "created_at", "updated_at"])
    for lead in leads:
        writer.writerow([
            _csv_safe(lead.customer_phone),
            _csv_safe(lead.customer_name or ""),
            _csv_safe(lead.summary or ""),
            lead.status,
            lead.created_at.isoformat(),
            lead.updated_at.isoformat(),
        ])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads.csv"},
    )
