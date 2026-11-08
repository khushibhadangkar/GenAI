from fastapi import APIRouter
from app.config import settings
from app.services.nmt_service import nmt_service
from app.services.llm_service import llm_service
from app.services.blip_service import blip_service
from app.services.tts_service import tts_service
from app.models.schemas import ModelStatusResponse

router = APIRouter(prefix="/api", tags=["Health & Status"])

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "device": str(nmt_service.device)
    }

@router.get("/models/status", response_model=ModelStatusResponse)
def get_model_status():
    has_key = llm_service.is_configured()
    llm_msg = f"Live Cloud Connected ({settings.LLM_MODEL})" if has_key else "Demo Simulation Active (Click to Add Key)"
    
    return ModelStatusResponse(
        nmt_hi_loaded=nmt_service.is_model_loaded("hi"),
        nmt_hi_model=settings.NMT_MODEL_HI,
        nmt_mr_loaded=nmt_service.is_model_loaded("mr"),
        nmt_mr_model=settings.NMT_MODEL_MR,
        blip_loaded=blip_service.is_loaded(),
        blip_model=settings.BLIP_MODEL,
        llm_configured=True,
        llm_model=settings.LLM_MODEL if has_key else f"{settings.LLM_MODEL} (Demo Mode)",
        llm_message=llm_msg,
        tts_available=tts_service.is_available(),
        device=str(nmt_service.device)
    )

@router.post("/models/config")
def update_llm_config(payload: dict):
    if "llm_api_key" in payload:
        settings.LLM_API_KEY = payload["llm_api_key"].strip()
        llm_service.api_key = settings.LLM_API_KEY
        llm_service._client = None
    if "llm_model" in payload and payload["llm_model"]:
        settings.LLM_MODEL = payload["llm_model"].strip()
        llm_service.model = settings.LLM_MODEL
        llm_service._client = None
    if "llm_base_url" in payload:
        settings.LLM_BASE_URL = payload["llm_base_url"].strip()
        llm_service.base_url = settings.LLM_BASE_URL if settings.LLM_BASE_URL else None
        llm_service._client = None

    # Persist to .env
    env_file = settings.AUDIO_CACHE_DIR.parent / ".env"
    lines = [
        f"LLM_API_KEY={settings.LLM_API_KEY}\n",
        f"LLM_MODEL={settings.LLM_MODEL}\n",
        f"LLM_BASE_URL={settings.LLM_BASE_URL}\n",
        f"NMT_MODEL_HI={settings.NMT_MODEL_HI}\n",
        f"NMT_MODEL_MR={settings.NMT_MODEL_MR}\n",
        f"BLIP_MODEL={settings.BLIP_MODEL}\n",
        f"DEVICE={settings.DEVICE}\n"
    ]
    with open(env_file, "w", encoding="utf-8") as f:
        f.writelines(lines)

    return get_model_status()

