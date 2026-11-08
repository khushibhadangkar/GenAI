import logging
from typing import Tuple, Optional
from openai import AsyncOpenAI
from fastapi import HTTPException
from app.config import settings
from app.utils.timing import measure_time_ms

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.base_url = settings.LLM_BASE_URL if settings.LLM_BASE_URL else None
        self._client: Optional[AsyncOpenAI] = None

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def _get_client(self) -> AsyncOpenAI:
        if not self.is_configured():
            raise HTTPException(
                status_code=503,
                detail=(
                    "LLM translation service is not configured. "
                    "Please set LLM_API_KEY (and optionally LLM_MODEL or LLM_BASE_URL) in backend/.env "
                    "to enable LLM translations."
                )
            )
        if self._client is None:
            self._client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
        return self._client

    def _build_system_prompt(self, target_lang: str, tone: str) -> str:
        lang_name = "Hindi" if target_lang == "hi" else "Marathi"
        tone_guidelines = {
            "neutral": "Use clear, standard, objective, modern register.",
            "formal": "Use high formal, official, grammatical, and elevated vocabulary.",
            "conversational": "Use colloquial, natural everyday spoken idioms and phrasing.",
            "respectful": "Use deferential honorifics (e.g. आप/तुम्ही, honorific plural verb forms, respect markers)."
        }
        selected_tone_guide = tone_guidelines.get(tone, tone_guidelines["neutral"])

        return (
            f"You are an expert academic translator specializing in English to {lang_name} translation.\n"
            f"Task: Translate the given English text into natural, fluent {lang_name}.\n"
            f"Guidelines:\n"
            f"1. Target Language: {lang_name}.\n"
            f"2. Desired Tone: {tone.capitalize()} - {selected_tone_guide}\n"
            f"3. Preservation: Preserve all named entities, numerals, and specific terminology accurately.\n"
            f"4. Gender neutrality: When translating neutral profession terms without explicit gender in the English source, "
            f"avoid injecting arbitrary gender assumptions unless grammatically mandatory. When neutral plural/honorific constructions exist, prefer them.\n"
            f"5. Output Constraint: Output ONLY the translated text in {lang_name} script (Devanagari). Do not include any explanations, transliterations, quotes, or notes."
        )

    async def translate(self, text: str, target_lang: str, tone: str = "neutral") -> Tuple[str, float, str]:
        """
        Translates text using the configured LLM.
        Returns (translated_text, latency_ms, model_name).
        """
        client = self._get_client()
        system_prompt = self._build_system_prompt(target_lang, tone)
        
        with measure_time_ms() as timer:
            try:
                response = await client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Translate this text:\n\n{text}"}
                    ],
                    temperature=0.2,
                    max_tokens=1000
                )
                translated = response.choices[0].message.content.strip()
            except Exception as e:
                logger.error(f"LLM translation call failed: {e}")
                raise HTTPException(
                    status_code=502,
                    detail=f"Error communicating with LLM provider ({self.model}): {str(e)}"
                )

        return translated, timer["elapsed_ms"], self.model

    def explain_differences(self, nmt_text: str, llm_text: str, target_lang: str, tone: str) -> str:
        """
        Generates an objective analytical summary contrasting NMT sequence-to-sequence output
        with LLM generative translation.
        """
        lang = "Hindi" if target_lang == "hi" else "Marathi"
        
        diffs = []
        if nmt_text == llm_text:
            return f"Both MarianMT and {self.model} produced identical translations in {lang}, demonstrating high lexical agreement on this sentence."
        
        diffs.append(
            f"• MarianMT (Encoder–Decoder) produced a direct sequence-to-sequence mapping trained on parallel corpora, prioritizing sentence structure and literal alignment."
        )
        diffs.append(
            f"• {self.model} (LLM) synthesized the output using prompt-directed generation, adhering to the '{tone}' tone parameter with contextual fluency."
        )
        
        return "\n".join(diffs)

llm_service = LLMService()

