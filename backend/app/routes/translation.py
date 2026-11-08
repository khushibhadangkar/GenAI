import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    TranslationRequest,
    TranslationResponse,
    TranslationResultItem,
    ComparisonResponse,
    TranslationEngine
)
from app.services.nmt_service import nmt_service
from app.services.llm_service import llm_service
from app.utils.validation import validate_text_input

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/translate", tags=["Translation"])

@router.post("", response_model=TranslationResponse)
async def translate_text(req: TranslationRequest):
    source_text = validate_text_input(req.text)
    target_lang = req.target_lang.value
    results = []

    if req.engine == TranslationEngine.NMT or req.engine == TranslationEngine.COMPARE:
        try:
            nmt_text, latency, model_id = nmt_service.translate(source_text, target_lang)
            results.append(TranslationResultItem(
                engine="nmt",
                model_name=model_id,
                translated_text=nmt_text,
                latency_ms=latency,
                target_lang=target_lang,
                tone=req.tone.value,
                explanation="Encoder–Decoder sequence-to-sequence translation via MarianMT."
            ))
        except Exception as e:
            logger.error(f"NMT translation error: {e}")
            raise HTTPException(status_code=500, detail=f"NMT translation error: {str(e)}")

    if req.engine == TranslationEngine.LLM or req.engine == TranslationEngine.COMPARE:
        try:
            llm_text, latency, model_id = await llm_service.translate(
                source_text, target_lang, req.tone.value
            )
            results.append(TranslationResultItem(
                engine="llm",
                model_name=model_id,
                translated_text=llm_text,
                latency_ms=latency,
                target_lang=target_lang,
                tone=req.tone.value,
                explanation=f"Contextual instruction-following generation ({req.tone.value} register)."
            ))
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"LLM translation error: {e}")
            raise HTTPException(status_code=500, detail=f"LLM translation error: {str(e)}")

    return TranslationResponse(
        source_text=source_text,
        target_lang=target_lang,
        tone=req.tone.value,
        results=results
    )

@router.post("/compare", response_model=ComparisonResponse)
async def compare_translations(req: TranslationRequest):
    source_text = validate_text_input(req.text)
    target_lang = req.target_lang.value
    tone = req.tone.value

    # 1. Run MarianMT NMT
    try:
        nmt_text, nmt_latency, nmt_model = nmt_service.translate(source_text, target_lang)
        nmt_item = TranslationResultItem(
            engine="nmt",
            model_name=nmt_model,
            translated_text=nmt_text,
            latency_ms=nmt_latency,
            target_lang=target_lang,
            tone=tone,
            explanation="MarianMT Encoder–Decoder neural sequence-to-sequence prediction."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NMT error during comparison: {str(e)}")

    # 2. Run LLM if configured
    llm_item = None
    if llm_service.is_configured():
        try:
            llm_text, llm_latency, llm_model = await llm_service.translate(source_text, target_lang, tone)
            llm_item = TranslationResultItem(
                engine="llm",
                model_name=llm_model,
                translated_text=llm_text,
                latency_ms=llm_latency,
                target_lang=target_lang,
                tone=tone,
                explanation=f"LLM prompt-conditioned generation ({tone} register)."
            )
        except Exception as e:
            logger.warning(f"LLM error during comparison: {e}")
            llm_item = None

    # 3. Qualitative difference explanation
    if llm_item:
        diff_text = llm_service.explain_differences(nmt_text, llm_item.translated_text, target_lang, tone)
    else:
        diff_text = (
            "MarianMT output generated successfully. "
            "Configure LLM_API_KEY in backend/.env to view live side-by-side LLM comparison."
        )

    return ComparisonResponse(
        source_text=source_text,
        target_lang=target_lang,
        tone=tone,
        nmt=nmt_item,
        llm=llm_item,
        difference_explanation=diff_text
    )

