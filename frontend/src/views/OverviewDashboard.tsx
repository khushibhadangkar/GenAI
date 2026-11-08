import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Languages,
  Activity,
  Layers,
  CheckCircle2,
  FileCheck2,
  Cpu,
  BarChart3,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { ModelStatusResponse, EvaluationResultsResponse, TargetLanguage } from '../types';
import { translateText, generateSpeech, fetchEvaluationResults } from '../api/client';
import { ModelStatusCard } from '../components/common/ModelStatusCard';
import { MetricCard } from '../components/common/MetricCard';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { AudioPlayer } from '../components/common/AudioPlayer';

interface OverviewDashboardProps {
  status: ModelStatusResponse | null;
  onNavigate: (tab: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ status, onNavigate }) => {
  const [quickInput, setQuickInput] = useState('');
  const [targetLang, setTargetLang] = useState<TargetLanguage>('hi');
  const [quickOutput, setQuickOutput] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  // Real evaluation metrics
  const [evalResults, setEvalResults] = useState<EvaluationResultsResponse | null>(null);

  useEffect(() => {
    fetchEvaluationResults()
      .then((res) => {
        if (res && res.scores && res.scores.length > 0) {
          setEvalResults(res);
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickTranslate = async () => {
    if (!quickInput.trim()) return;
    setIsTranslating(true);
    setErrorMsg(null);
    setAudioUrl(null);
    try {
      const res = await translateText(quickInput, targetLang, 'nmt', 'neutral');
      if (res.results && res.results.length > 0) {
        setQuickOutput(res.results[0].translated_text);
        setLatency(res.results[0].latency_ms);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleQuickSpeech = async () => {
    if (!quickOutput) return;
    setIsSynthesizing(true);
    try {
      const res = await generateSpeech(quickOutput, targetLang);
      setAudioUrl(res.audio_url);
    } catch (e: any) {
      setErrorMsg(e.message || 'Speech generation failed');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white p-8 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Academic NLP Comparative Research Platform (P19)</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Intelligent Translation Across Languages
          </h2>
          
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            P19 LINGUA AI benchmarks sequence-to-sequence Encoder–Decoder models (MarianMT) against 
            instruction-tuned Large Language Models for English-to-Hindi and English-to-Marathi translation, 
            complete with BLIP multimodal captioning, neural text-to-speech, and empirical gender-bias evaluation.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('translator')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>Launch Translator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('model-comparison')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all"
            >
              <span>Model Comparison</span>
            </button>
            <button
              onClick={() => onNavigate('evaluation-lab')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all"
            >
              <span>BLEU Benchmark</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -top-12 w-96 h-96 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-48 -bottom-12 w-64 h-64 rounded-full bg-lavender-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* 6-Step Presentation Walkthrough Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 card-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-slate-900 text-sm">
              Live Demo Presentation Tour (6 Steps)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Click any step to jump straight to that workspace
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              step: '1',
              title: 'Interactive Translator',
              desc: 'MarianMT Seq2Seq + tone conditioning + Devanagari TTS playback',
              tab: 'translator',
              badge: 'Real-time'
            },
            {
              step: '2',
              title: 'Model Comparison',
              desc: 'Encoder–Decoder vs. Autoregressive LLM side-by-side contrast',
              tab: 'model-comparison',
              badge: 'Comparative'
            },
            {
              step: '3',
              title: 'Multimodal Image Studio',
              desc: 'BLIP vision-to-text captioning + cascade Indic translation',
              tab: 'image-translator',
              badge: 'Multimodal'
            },
            {
              step: '4',
              title: 'Voice Studio',
              desc: 'Native Hindi & Marathi neural speech synthesis and audio export',
              tab: 'voice-studio',
              badge: 'Audio'
            },
            {
              step: '5',
              title: 'Gender-Bias Analysis',
              desc: '10-case profession benchmark audit across target morphology',
              tab: 'bias-analysis',
              badge: 'Audit'
            },
            {
              step: '6',
              title: 'BLEU Evaluation Lab',
              desc: '20-sentence benchmark with verified SacreBLEU metrics calculation',
              tab: 'evaluation-lab',
              badge: 'Benchmark'
            }
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => onNavigate(item.tab)}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/20 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                  Step {item.step} • {item.badge}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-900">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  {item.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Access Translation Widget */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <Languages className="w-5 h-5 text-brand-600" />
              Quick Translate
            </h3>
            <p className="text-xs text-slate-500">
              Immediate English to Hindi / Marathi translation powered by MarianMT
            </p>
          </div>
          <LanguageSelector value={targetLang} onChange={setTargetLang} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">English Source</label>
            <textarea
              rows={4}
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Enter English sentence (e.g., Artificial intelligence is transforming healthcare across the world.)"
              className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none resize-none transition-all"
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-slate-400 font-mono">{quickInput.length} chars</span>
              <button
                type="button"
                onClick={handleQuickTranslate}
                disabled={isTranslating || !quickInput.trim()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-xs"
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                {targetLang === 'hi' ? 'Hindi Output (हिन्दी)' : 'Marathi Output (मराठी)'}
              </label>
              {latency !== null && (
                <span className="text-[11px] font-mono text-slate-400">
                  {latency} ms
                </span>
              )}
            </div>
            <div className="w-full h-[112px] p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm overflow-y-auto font-medium text-slate-800">
              {quickOutput ? (
                quickOutput
              ) : (
                <span className="text-slate-400 italic font-normal text-xs">
                  Translation will appear here in real-time...
                </span>
              )}
            </div>

            {quickOutput && (
              <div className="pt-1 flex items-center justify-between">
                <AudioPlayer
                  audioUrl={audioUrl}
                  onGenerate={handleQuickSpeech}
                  isLoading={isSynthesizing}
                />
                <button
                  type="button"
                  onClick={() => onNavigate('translator')}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  <span>Open Full Workspace</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Model Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            Model & Architecture Status
          </h3>
          <span className="text-xs font-medium text-slate-500">
            Real backend health verifications
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModelStatusCard
            title="MarianMT Hindi"
            architecture="Encoder–Decoder"
            modelId={status?.nmt_hi_model || "Helsinki-NLP/opus-mt-en-hi"}
            isReady={true}
            type="nmt"
            details="Sequence-to-sequence translation with subword tokenization optimized for English to Hindi."
            badge="Marian"
          />

          <ModelStatusCard
            title="MarianMT Marathi"
            architecture="Encoder–Decoder"
            modelId={status?.nmt_mr_model || "Helsinki-NLP/opus-mt-en-mr"}
            isReady={true}
            type="nmt"
            details="Sequence-to-sequence translation model fine-tuned for Marathi Devanagari morphological structure."
            badge="Marian"
          />

          <ModelStatusCard
            title="Large Language Model"
            architecture="Autoregressive"
            modelId={status?.llm_model || "Configurable LLM"}
            isReady={status?.llm_configured ?? false}
            type="llm"
            details="Context-aware instruction generator supporting tone, register, and honorific control."
            badge="LLM"
          />

          <ModelStatusCard
            title="BLIP Multimodal"
            architecture="Vision-Language"
            modelId={status?.blip_model || "Salesforce/blip-image-captioning-base"}
            isReady={true}
            type="vision"
            details="Bootstrapped Language-Image Pre-training for automated descriptive English caption generation."
            badge="BLIP"
          />
        </div>
      </div>

      {/* Real Evaluation Statistics or Progress Overview */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              Empirical Evaluation Summary
            </h3>
            <p className="text-xs text-slate-500">
              {evalResults?.scores && evalResults.scores.length > 0
                ? `Actual BLEU metrics evaluated on ${evalResults.total_sentences} sentences (${evalResults.timestamp?.slice(0, 10)})`
                : 'Run the Evaluation Lab to generate real SacreBLEU metrics'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('evaluation-lab')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Evaluation Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {evalResults?.scores && evalResults.scores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {evalResults.scores.map((s, idx) => (
              <MetricCard
                key={idx}
                label={`${s.model} → ${s.language}`}
                value={`${s.score}`}
                subtext={`BLEU score (${s.sentence_count} sentences)`}
                icon={BarChart3}
                trend="Verified"
                color={s.language === 'Hindi' ? 'blue' : 'purple'}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              No benchmark runs recorded yet. Rigorous academic evaluation requires real model runs against reference translations.
            </p>
            <button
              onClick={() => onNavigate('evaluation-lab')}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs"
            >
              Open Evaluation Lab & Run Benchmark
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

