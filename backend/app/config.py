import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "P19 - LINGUA AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # NMT Checkpoints
    NMT_MODEL_HI: str = "Helsinki-NLP/opus-mt-en-hi"
    NMT_MODEL_MR: str = "Helsinki-NLP/opus-mt-en-mr"
    
    # BLIP Checkpoint
    BLIP_MODEL: str = "Salesforce/blip-image-captioning-base"
    
    # LLM Settings (supports OpenAI, Groq, Anthropic, Gemini-via-OpenAI-compat, Ollama)
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_BASE_URL: str = ""
    
    # Audio & Upload storage
    AUDIO_CACHE_DIR: Path = BASE_DIR / "audio_cache"
    DATA_DIR: Path = BASE_DIR / "app" / "data"
    
    # Device selection ("auto", "cuda", "mps", "cpu")
    DEVICE: str = "auto"
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
settings.AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)

