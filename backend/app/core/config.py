from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "med-doc-backend"
    app_env: str = "dev"
    api_prefix: str = "/api"

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "med_docs"
    mongo_server_selection_timeout_ms: int = 1500
    mongo_connect_timeout_ms: int = 1500
    mongo_socket_timeout_ms: int = 2000

    openfda_base_url: str = "https://api.fda.gov"
    openfda_timeout_seconds: float = 4.0
    external_api_timeout_seconds: float = 4.0

    interaction_cache_ttl_hours: int = 24

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
