import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.models.schemas import SpeechRequest, SpeechResponse
from app.services.tts_service import tts_service
from app.config import settings
from app.utils.validation import validate_text_input

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/speech", tags=["Voice Studio & TTS"])

@router.post("", response_model=SpeechResponse)
def generate_speech(req: SpeechRequest):
    text = validate_text_input(req.text, max_chars=2000)
    target_lang = req.target_lang.value
    
    filename = tts_service.synthesize(text, target_lang, slow=req.slow)
    audio_url = f"/api/speech/audio/{filename}"
    
    return SpeechResponse(
        audio_url=audio_url,
        language=target_lang,
        filename=filename
    )

@router.api_route("/audio/{filename}", methods=["GET", "HEAD"])
def stream_audio(filename: str):
    file_path = settings.AUDIO_CACHE_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found.")
    
    return FileResponse(
        path=str(file_path),
        media_type="audio/mpeg",
        filename=filename,
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )

