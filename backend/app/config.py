from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://aether:aether@localhost:5432/aether"

    discord_client_id: str = ""
    discord_client_secret: str = ""
    discord_redirect_uri: str = "http://localhost:8000/api/auth/discord/callback"
    discord_guild_id: str = ""
    discord_admin_role_ids: str = ""
    discord_editor_role_ids: str = ""

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    session_max_age: int = 60 * 60 * 24 * 7

    frontend_url: str = "http://localhost:3000"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def admin_role_id_set(self) -> set[str]:
        return {r.strip() for r in self.discord_admin_role_ids.split(",") if r.strip()}

    @property
    def editor_role_id_set(self) -> set[str]:
        return {r.strip() for r in self.discord_editor_role_ids.split(",") if r.strip()}


settings = Settings()
