from pydantic import BaseModel


class ImportCommitIn(BaseModel):
    mapping: dict[str, str | None]
    rows: list[dict]
