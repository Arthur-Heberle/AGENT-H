from pydantic import BaseModel, Field


class ImportCommitIn(BaseModel):
    mapping: dict[str, str | None]
    rows: list[dict] = Field(..., max_length=500)
