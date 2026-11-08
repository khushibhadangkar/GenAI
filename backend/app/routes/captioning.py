import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import CaptionResponse, CaptionTranslateRequest, TranslationResultItem
from app.services.blip_service import blip_service
from app.services.nmt_service import nmt_service
from app.services.llm_service import llm_service
from app.utils.validation import validate_image_upload, validate_text_input

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/caption", tags=["Image Captioning"])

@router.post("", response_model=CaptionResponse)
async def generate_caption(file: UploadFile = File(...)):
    image = await validate_image_upload(file)
    try:
        caption, latency, model_id = blip_service.generate_caption(image)
        return CaptionResponse(
            caption=caption,
            model_name=model_id,
            latency_ms=latency
        )
    except Exception as e:
        logger.error(f"Image captioning error: {e}")
        raise HTTPException(status_code=500, detail=f"BLIP image captioning error: {str(e)}")

@router.post("/translate", response_model=TranslationResultItem)
async def translate_caption(req: CaptionTranslateRequest):
    caption = validate_text_input(req.caption)
    target_lang = req.target_lang.value
    
    if req.engine.value == "llm":
        try:
            translated, latency, model_id = await llm_service.translate(
                caption, target_lang, req.tone.value
            )
            return TranslationResultItem(
                engine="llm",
                model_name=model_id,
                translated_text=translated,
                latency_ms=latency,
                target_lang=target_lang,
                tone=req.tone.value,
                explanation=f"LLM translated caption ({req.tone.value} tone)."
            )
        except Exception as e:
            logger.warning(f"LLM caption translation failed ({e}), falling back to NMT")
            
    # Default to NMT
    try:
        translated, latency, model_id = nmt_service.translate(caption, target_lang)
        return TranslationResultItem(
            engine="nmt",
            model_name=model_id,
            translated_text=translated,
            latency_ms=latency,
            target_lang=target_lang,
            tone=req.tone.value,
            explanation="MarianMT translated image caption."
        )
    except Exception as e:
        logger.error(f"Caption translation error: {e}")
        raise HTTPException(status_code=500, detail=f"Caption translation error: {str(e)}")

