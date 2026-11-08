import React from 'react';
import { Menu, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { NavItem } from './Sidebar';
import { ModelStatusResponse } from '../../types';

interface HeaderProps {
  currentTab: NavItem;
  status: ModelStatusResponse | null;
  onOpenMobile: () => void;
}

const titles: Record<NavItem, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview Dashboard',
    subtitle: 'High-level telemetry, active model checkpoints, and platform capabilities.'
  },
  translator: {
    title: 'Interactive Translator',
    subtitle: 'Translate English text to Hindi & Marathi with MarianMT and instruction-guided LLMs.'
  },
  'image-translator': {
    title: 'Image Translation Studio',
    subtitle: 'Extract visual captions using BLIP and translate them into target Indic languages.'
  },
  'model-comparison': {
    title: 'Architecture & Model Comparison',
    subtitle: 'Side-by-side contrast of Encoder–Decoder sequence-to-sequence vs. autoregressive LLMs.'
  },
  'voice-studio': {
    title: 'Voice Studio',
    subtitle: 'Synthesize native Hindi and Marathi speech with playback and audio export.'
  },
  'bias-analysis': {
    title: 'Gender-Bias Evaluation Lab',
    subtitle: 'Investigate profession translations across occupational stereotypes and target morphology.'
  },
  'evaluation-lab': {
    title: 'Benchmark & BLEU Evaluation Lab',
    subtitle: 'Rigorous 20-sentence benchmark evaluation using verified SacreBLEU scoring.'
  },
  about: {
    title: 'Academic Project Dossier',
    subtitle: 'P19 problem formulation, U1–U5 work units, methodologies, and architectural specifics.'
  }
};

export const Header: React.FC<HeaderProps> = ({ currentTab, status, onOpenMobile }) => {
  const meta = titles[currentTab] || { title: 'Lingua AI', subtitle: 'Translation Platform' };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
            {meta.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language badges */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-medium text-slate-600">
          <Globe className="w-3.5 h-3.5 text-brand-600" />
          <span>EN → HI & MR</span>
        </div>

        {/* Live LLM Status */}
        {status && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              status.llm_configured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={status.llm_configured ? `LLM Active: ${status.llm_model}` : (status.llm_message || 'LLM not configured')}
          >
            {status.llm_configured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">LLM: {status.llm_model}</span>
                <span className="sm:hidden">LLM</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">LLM Key Needed</span>
                <span className="sm:hidden">No LLM</span>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

