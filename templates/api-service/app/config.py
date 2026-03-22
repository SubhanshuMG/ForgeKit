from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./app.db"
    secret_key: str = "change-me"
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
