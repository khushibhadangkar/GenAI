import {
  TranslationRequest,
  TranslationResponse,
  ComparisonResponse,
  CaptionResponse,
  SpeechResponse,
  EvaluationDatasetResponse,
  EvaluationResultsResponse,
  BiasResultsResponse,
  BiasCaseItem,
  ModelStatusResponse,
  TargetLanguage,
  TranslationEngine,
  TranslationTone
} from '../types';

const BACKEND_URL: string = (import.meta as any).env?.VITE_BACKEND_URL || '';
const API_BASE = BACKEND_URL ? `${BACKEND_URL.replace(/\/$/, '')}/api` : '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

export async function fetchModelStatus(): Promise<ModelStatusResponse> {
  const res = await fetch(`${API_BASE}/models/status`);
  if (!res.ok) throw new Error('Failed to fetch model status');
  return res.json();
}

export async function translateText(
  text: string,
  target_lang: TargetLanguage,
  engine: TranslationEngine = 'nmt',
  tone: TranslationTone = 'neutral'
): Promise<TranslationResponse> {
  const res = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, target_lang, engine, tone })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Translation failed with status ${res.status}`);
  }
  return res.json();
}

export async function compareTranslations(
  text: string,
  target_lang: TargetLanguage,
  tone: TranslationTone = 'neutral'
): Promise<ComparisonResponse> {
  const res = await fetch(`${API_BASE}/translate/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, target_lang, engine: 'compare', tone })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Comparison failed with status ${res.status}`);
  }
  return res.json();
}

export async function generateCaption(file: File): Promise<CaptionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/caption`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Image captioning failed with status ${res.status}`);
  }
  return res.json();
}

export async function translateCaption(
  caption: string,
  target_lang: TargetLanguage,
  engine: TranslationEngine = 'nmt',
  tone: TranslationTone = 'neutral'
) {
  const res = await fetch(`${API_BASE}/caption/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption, target_lang, engine, tone })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Caption translation failed with status ${res.status}`);
  }
  return res.json();
}

export async function generateSpeech(
  text: string,
  target_lang: TargetLanguage,
  slow: boolean = false
): Promise<SpeechResponse> {
  const res = await fetch(`${API_BASE}/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, target_lang, slow })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Speech synthesis failed with status ${res.status}`);
  }
  const data = await res.json();
  if (data.audio_url && data.audio_url.startsWith('/')) {
    data.audio_url = BACKEND_URL ? `${BACKEND_URL.replace(/\/$/, '')}${data.audio_url}` : data.audio_url;
  }
  return data;
}

export async function fetchEvaluationDataset(): Promise<EvaluationDatasetResponse> {
  const res = await fetch(`${API_BASE}/evaluation/dataset`);
  if (!res.ok) throw new Error('Failed to fetch evaluation dataset');
  return res.json();
}

export async function updateEvaluationReference(
  id: number,
  reference_hi?: string,
  reference_mr?: string
) {
  const res = await fetch(`${API_BASE}/evaluation/references`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, reference_hi, reference_mr })
  });
  if (!res.ok) throw new Error('Failed to update reference translation');
  return res.json();
}

export async function runEvaluation(
  engines: string[] = ['nmt', 'llm'],
  languages: string[] = ['hi', 'mr']
): Promise<EvaluationResultsResponse> {
  const res = await fetch(`${API_BASE}/evaluation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engines, languages })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Evaluation run failed');
  }
  return res.json();
}

export async function fetchEvaluationResults(): Promise<EvaluationResultsResponse> {
  const res = await fetch(`${API_BASE}/evaluation/results`);
  if (!res.ok) throw new Error('Failed to fetch evaluation results');
  return res.json();
}

export async function fetchBiasCases(): Promise<BiasCaseItem[]> {
  const res = await fetch(`${API_BASE}/bias/cases`);
  if (!res.ok) throw new Error('Failed to fetch bias cases');
  return res.json();
}

export async function runBiasTranslations(): Promise<BiasCaseItem[]> {
  const res = await fetch(`${API_BASE}/bias/run`, {
    method: 'POST'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to run bias translations');
  }
  return res.json();
}

export async function updateBiasObservation(
  id: number,
  category: string,
  reviewer_notes: string
): Promise<BiasCaseItem> {
  const res = await fetch(`${API_BASE}/bias/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, category, reviewer_notes })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update bias record');
  }
  return res.json();
}

export async function fetchBiasResults(): Promise<BiasResultsResponse> {
  const res = await fetch(`${API_BASE}/bias/results`);
  if (!res.ok) throw new Error('Failed to fetch bias results');
  return res.json();
}

export function getEvaluationExportUrl(): string {
  return `${API_BASE}/evaluation/export`;
}

export function getBiasExportUrl(): string {
  return `${API_BASE}/bias/export`;
}

export async function updateModelConfig(config: {
  llm_api_key?: string;
  llm_model?: string;
  llm_base_url?: string;
}): Promise<ModelStatusResponse> {
  const res = await fetch(`${API_BASE}/models/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update model configuration');
  }
  return res.json();
}

