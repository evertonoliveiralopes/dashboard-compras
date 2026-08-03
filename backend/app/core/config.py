from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Aplicação
    APP_NAME: str = "Compra360"

    # Banco de Dados
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str

    # JWT
    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()