from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    EMBEDDING_API_KEY: str
    EMBEDDING_MODEL: str
    LLM_API_KEY: str
    LLM_BASE_URL: str
    LLM_MODEL: str
    PROCESS_SECRET: str
    DEFAULT_BUSINESS_PHONE: str
    MIN_SIMILARITY: float = 0.30  # products below this cosine similarity are not sent to the LLM
    JWT_SECRET: str
    JWT_EXPIRY_HOURS: int
    EVOLUTION_API_URL: str = ""
    EVOLUTION_API_KEY: str = ""
    EVOLUTION_INSTANCE: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
