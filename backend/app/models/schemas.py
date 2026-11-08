from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class TargetLanguage(str, Enum):
    HINDI = "hi"
    MARATHI = "mr"

class TranslationEngine(str, Enum):
    NMT = "nmt"
    LLM = "llm"
    COMPARE = "compare"

class TranslationTone(str, Enum):
    NEUTRAL = "neutral"
    FORMAL = "formal"
    CONVERSATIONAL = "conversational"
    RESPECTFUL = "respectful"

class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="English source text to translate")
    target_lang: TargetLanguage = Field(default=TargetLanguage.HINDI, description="Target language ('hi' or 'mr')")
    engine: TranslationEngine = Field(default=TranslationEngine.NMT, description="Translation engine")
    tone: TranslationTone = Field(default=TranslationTone.NEUTRAL, description="Tone/register style")

class TranslationResultItem(BaseModel):
    engine: str
    model_name: str
    translated_text: str
    latency_ms: float
    target_lang: str
    tone: Optional[str] = None
    explanation: Optional[str] = None

class TranslationResponse(BaseModel):
    source_text: str
    target_lang: str
    tone: str
    results: List[TranslationResultItem]

class ComparisonResponse(BaseModel):
    source_text: str
    target_lang: str
    tone: str
    nmt: TranslationResultItem
    llm: Optional[TranslationResultItem] = None
    difference_explanation: str

class CaptionResponse(BaseModel):
    caption: str
    model_name: str
    latency_ms: float

class CaptionTranslateRequest(BaseModel):
    caption: str = Field(..., min_length=1, max_length=1000)
    target_lang: TargetLanguage = TargetLanguage.HINDI
    engine: TranslationEngine = TranslationEngine.NMT
    tone: TranslationTone = TranslationTone.NEUTRAL

class SpeechRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    target_lang: TargetLanguage = TargetLanguage.HINDI
    slow: bool = False

class SpeechResponse(BaseModel):
    audio_url: str
    language: str
    filename: str

class EvaluationSentence(BaseModel):
    id: int
    source: str
    domain: Optional[str] = "General"
    reference_hi: str
    reference_mr: str
    pred_nmt_hi: Optional[str] = None
    pred_llm_hi: Optional[str] = None
    pred_nmt_mr: Optional[str] = None
    pred_llm_mr: Optional[str] = None

class EvaluationDatasetResponse(BaseModel):
    total_sentences: int
    sentences: List[EvaluationSentence]

class UpdateReferencesRequest(BaseModel):
    id: int
    reference_hi: Optional[str] = None
    reference_mr: Optional[str] = None

class EvaluationRunRequest(BaseModel):
    engines: List[str] = ["nmt", "llm"]
    languages: List[str] = ["hi", "mr"]

class BleuScoreItem(BaseModel):
    model: str
    language: str
    score: float
    signature: str
    sentence_count: int
    timestamp: str

class EvaluationResultsResponse(BaseModel):
    timestamp: Optional[str] = None
    total_sentences: int
    scores: List[BleuScoreItem]
    sentences: List[EvaluationSentence]

class BiasCaseItem(BaseModel):
    id: int
    source: str
    profession: str
    explicit_gender: bool
    gender: Optional[str] = None
    grammatical_note: str
    nmt_hi: Optional[str] = None
    llm_hi: Optional[str] = None
    nmt_mr: Optional[str] = None
    llm_mr: Optional[str] = None
    category: Optional[str] = None
    reviewer_notes: Optional[str] = None
    reviewed: bool = False

class BiasObservationUpdate(BaseModel):
    id: int
    category: str
    reviewer_notes: str

class BiasResultsResponse(BaseModel):
    cases: List[BiasCaseItem]
    category_distribution: Dict[str, int]
    reviewed_count: int
    total_count: int

class ModelStatusResponse(BaseModel):
    nmt_hi_loaded: bool
    nmt_hi_model: str
    nmt_mr_loaded: bool
    nmt_mr_model: str
    blip_loaded: bool
    blip_model: str
    llm_configured: bool
    llm_model: str
    llm_message: Optional[str] = None
    tts_available: bool
    device: str

