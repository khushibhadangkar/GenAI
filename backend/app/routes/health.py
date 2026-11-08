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
    llm_configured = llm_service.is_configured()
    llm_msg = None if llm_configured else "Set LLM_API_KEY in backend/.env to enable LLM translation"
    
    return ModelStatusResponse(
        nmt_hi_loaded=nmt_service.is_model_loaded("hi"),
        nmt_hi_model=settings.NMT_MODEL_HI,
        nmt_mr_loaded=nmt_service.is_model_loaded("mr"),
        nmt_mr_model=settings.NMT_MODEL_MR,
        blip_loaded=blip_service.is_loaded(),
        blip_model=settings.BLIP_MODEL,
        llm_configured=llm_configured,
        llm_model=settings.LLM_MODEL,
        llm_message=llm_msg,
        tts_available=tts_service.is_available(),
        device=str(nmt_service.device)
    )

