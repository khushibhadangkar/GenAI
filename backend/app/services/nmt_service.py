import logging
import torch
from typing import Optional, Dict, Tuple
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from app.config import settings
from app.utils.timing import measure_time_ms

logger = logging.getLogger(__name__)

class NMTService:
    def __init__(self):
        self.device = self._detect_device()
        self._models: Dict[str, AutoModelForSeq2SeqLM] = {}
        self._tokenizers: Dict[str, AutoTokenizer] = {}
        logger.info(f"NMT Service initialized with target device: {self.device}")

    def _detect_device(self) -> torch.device:
        if settings.DEVICE == "cpu":
            return torch.device("cpu")
        elif settings.DEVICE == "cuda" and torch.cuda.is_available():
            return torch.device("cuda")
        elif settings.DEVICE == "mps" and torch.backends.mps.is_available():
            return torch.device("mps")
        
        # Auto-detect
        if torch.cuda.is_available():
            return torch.device("cuda")
        elif torch.backends.mps.is_available():
            return torch.device("mps")
        return torch.device("cpu")

    def _get_model_id(self, target_lang: str) -> str:
        if target_lang == "hi":
            return settings.NMT_MODEL_HI
        elif target_lang == "mr":
            return settings.NMT_MODEL_MR
        else:
            raise ValueError(f"Unsupported target language for NMT: {target_lang}")

    def is_model_loaded(self, target_lang: str) -> bool:
        return target_lang in self._models

    def load_model(self, target_lang: str) -> Tuple[AutoTokenizer, AutoModelForSeq2SeqLM]:
        if target_lang not in self._models:
            model_id = self._get_model_id(target_lang)
            logger.info(f"Loading NMT model checkpoint '{model_id}' on {self.device}...")
            
            try:
                # First attempt fast local cache check
                tokenizer = AutoTokenizer.from_pretrained(model_id, local_files_only=True)
                model = AutoModelForSeq2SeqLM.from_pretrained(model_id, local_files_only=True).to(self.device)
            except Exception:
                # Fallback to online fetch if not yet in cache
                tokenizer = AutoTokenizer.from_pretrained(model_id)
                model = AutoModelForSeq2SeqLM.from_pretrained(model_id).to(self.device)

            model.eval()
            self._tokenizers[target_lang] = tokenizer
            self._models[target_lang] = model
            logger.info(f"Successfully loaded {model_id} for {target_lang}")
            
        return self._tokenizers[target_lang], self._models[target_lang]

    def translate(self, text: str, target_lang: str) -> Tuple[str, float, str]:
        """
        Translates text from English to Hindi ('hi') or Marathi ('mr').
        Returns (translated_text, latency_ms, model_name).
        """
        tokenizer, model = self.load_model(target_lang)
        model_id = self._get_model_id(target_lang)
        
        with measure_time_ms() as timer:
            inputs = tokenizer(
                text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512
            ).to(self.device)

            with torch.no_grad():
                generated_tokens = model.generate(
                    **inputs,
                    max_length=512,
                    num_beams=4,
                    early_stopping=True
                )

            translated = tokenizer.decode(generated_tokens[0], skip_special_tokens=True).strip()

        return translated, timer["elapsed_ms"], model_id

nmt_service = NMTService()

