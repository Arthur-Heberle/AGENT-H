from pydantic import BaseModel, field_validator


class BusinessHoursDay(BaseModel):
    enabled: bool = False
    open: str = "06:00"
    close: str = "22:00"


class BusinessHours(BaseModel):
    mon: BusinessHoursDay = BusinessHoursDay(enabled=True)
    tue: BusinessHoursDay = BusinessHoursDay(enabled=True)
    wed: BusinessHoursDay = BusinessHoursDay(enabled=True)
    thu: BusinessHoursDay = BusinessHoursDay(enabled=True)
    fri: BusinessHoursDay = BusinessHoursDay(enabled=True)
    sat: BusinessHoursDay = BusinessHoursDay(enabled=True, close="13:00")
    sun: BusinessHoursDay = BusinessHoursDay()


class SettingsOut(BaseModel):
    system_prompt: str | None
    ai_language: str
    business_hours: BusinessHours


class SettingsIn(BaseModel):
    system_prompt: str | None = None
    ai_language: str = "auto"
    business_hours: BusinessHours = BusinessHours()

    @field_validator("system_prompt")
    @classmethod
    def cap_prompt(cls, v: str | None) -> str | None:
        if v and len(v) > 2000:
            raise ValueError("system_prompt must be 2000 characters or fewer")
        return v


class ProfileOut(BaseModel):
    business_name: str | None
    email: str
    business_phone: str


class ProfileIn(BaseModel):
    business_name: str | None = None
    email: str | None = None
