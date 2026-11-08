export type TargetLanguage = 'hi' | 'mr';
export type TranslationEngine = 'nmt' | 'llm' | 'compare';
export type TranslationTone = 'neutral' | 'formal' | 'conversational' | 'respectful';

export interface TranslationResultItem {
  engine: string;
  model_name: string;
  translated_text: string;
  latency_ms: number;
  target_lang: string;
  tone?: string;
  explanation?: string;
}

export interface TranslationRequest {
  text: string;
  target_lang: TargetLanguage;
  engine: TranslationEngine;
  tone: TranslationTone;
}

export interface EvaluationDatasetResponse {
  total_sentences: number;
  sentences: EvaluationSentence[];
}

export interface TranslationResponse {
  source_text: string;
  target_lang: string;
  tone: string;
  results: TranslationResultItem[];
}

export interface ComparisonResponse {
  source_text: string;
  target_lang: string;
  tone: string;
  nmt: TranslationResultItem;
  llm: TranslationResultItem | null;
  difference_explanation: string;
}

export interface CaptionResponse {
  caption: string;
  model_name: string;
  latency_ms: number;
}

export interface SpeechResponse {
  audio_url: string;
  language: string;
  filename: string;
}

export interface EvaluationSentence {
  id: number;
  source: string;
  domain?: string;
  reference_hi: string;
  reference_mr: string;
  pred_nmt_hi?: string | null;
  pred_llm_hi?: string | null;
  pred_nmt_mr?: string | null;
  pred_llm_mr?: string | null;
}

export interface BleuScoreItem {
  model: string;
  language: string;
  score: number;
  signature: string;
  sentence_count: number;
  timestamp: string;
}

export interface EvaluationResultsResponse {
  timestamp: string | null;
  total_sentences: number;
  scores: BleuScoreItem[];
  sentences: EvaluationSentence[];
}

export interface BiasCaseItem {
  id: number;
  source: string;
  profession: string;
  explicit_gender: boolean;
  gender?: string | null;
  grammatical_note: string;
  nmt_hi?: string | null;
  llm_hi?: string | null;
  nmt_mr?: string | null;
  llm_mr?: string | null;
  category?: string | null;
  reviewer_notes?: string | null;
  reviewed: boolean;
}

export interface BiasResultsResponse {
  cases: BiasCaseItem[];
  category_distribution: Record<string, number>;
  reviewed_count: number;
  total_count: number;
}

export interface ModelStatusResponse {
  nmt_hi_loaded: boolean;
  nmt_hi_model: string;
  nmt_mr_loaded: boolean;
  nmt_mr_model: string;
  blip_loaded: boolean;
  blip_model: string;
  llm_configured: boolean;
  llm_model: string;
  llm_message?: string | null;
  tts_available: boolean;
  device: string;
}
