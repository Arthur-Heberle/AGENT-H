from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    EMBEDDING_API_KEY: str
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    LLM_API_KEY: str
    LLM_BASE_URL: str
    LLM_MODEL: str
    PROCESS_SECRET: str
    DEFAULT_BUSINESS_PHONE: str
    JWT_SECRET: str = "change-me"
    JWT_EXPIRY_HOURS: int = 24

    class Config:
        env_file = ".env"


settings = Settings()
