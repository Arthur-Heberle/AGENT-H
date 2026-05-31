from pydantic import BaseModel


class DayVolume(BaseModel):
    date: str
    count: int


class StatsOut(BaseModel):
    conversations_today: int
    conversations_delta_pct: float
    avg_response_time_s: float | None
    human_handoffs_today: int
    leads_today: int
    leads_delta_pct: float
    volume_7d: list[DayVolume]
