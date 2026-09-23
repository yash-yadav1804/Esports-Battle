from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Esports Battle API"
    environment: str = "development"
    api_prefix: str = "/api"
    database_url: str = "postgresql+psycopg://postgres:password@localhost:5432/esports_battle"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    client_url: str = "http://localhost:5173"
    rate_limit_requests: int = 300
    rate_limit_window_seconds: int = 900
    super_admin_name: str = ""
    super_admin_email: str = ""
    super_admin_password: str = ""
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
