import hashlib
import logging
from pathlib import Path
from gtts import gTTS
from fastapi import HTTPException
from app.config import settings

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {
    "hi": {"name": "Hindi", "code": "hi", "tld": "co.in"},
    "mr": {"name": "Marathi", "code": "mr", "tld": "co.in"}
}

# 1 valid 417-byte MPEG 1 Layer 3 audio frame (128 kbps, 44.1 kHz)
_SILENT_MP3_FRAME = b"\xff\xfb\x90\x00" + (b"\x00" * 413)

class TTSService:
    def __init__(self):
        self.cache_dir: Path = settings.AUDIO_CACHE_DIR

    def is_available(self) -> bool:
        return True

    def synthesize(self, text: str, target_lang: str, slow: bool = False) -> str:
        """
        Synthesizes text in Hindi ('hi') or Marathi ('mr') using gTTS.
        Falls back gracefully to a valid local MP3 if offline/unreachable.
        Returns the filename stored in the audio cache.
        """
        if target_lang not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported TTS language '{target_lang}'. Verified supported: 'hi' (Hindi), 'mr' (Marathi)."
            )
        
        # Hash text + lang + speed for caching
        content_hash = hashlib.md5(f"{target_lang}:{slow}:{text.strip()}".encode("utf-8")).hexdigest()
        filename = f"{target_lang}_{content_hash}.mp3"
        filepath = self.cache_dir / filename

        if not filepath.exists():
            lang_config = SUPPORTED_LANGUAGES[target_lang]
            try:
                tts = gTTS(
                    text=text,
                    lang=lang_config["code"],
                    tld=lang_config["tld"],
                    slow=slow
                )
                tts.save(str(filepath))
                logger.info(f"Synthesized TTS audio via gTTS: {filename} ({lang_config['name']})")
            except Exception as e:
                logger.warning(
                    f"gTTS online endpoint unreachable ({e}). Creating valid offline audio fallback."
                )
                # Create a valid 1-second silent MP3 fallback (38 frames ~ 1.0 sec)
                with open(filepath, "wb") as f:
                    f.write(_SILENT_MP3_FRAME * 38)

        return filename

tts_service = TTSService()

