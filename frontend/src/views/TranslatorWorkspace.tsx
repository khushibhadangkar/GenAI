import React, { useState } from 'react';
import {
  Languages,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Zap,
  Bot,
  Layers,
  ArrowRight,
  Info,
  AlertCircle
} from 'lucide-react';
import {
  TargetLanguage,
  TranslationEngine,
  TranslationTone,
  TranslationResultItem,
  ComparisonResponse
} from '../types';
import { translateText, compareTranslations, generateSpeech } from '../api/client';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ToneSelector } from '../components/common/ToneSelector';
import { AudioPlayer } from '../components/common/AudioPlayer';

export const TranslatorWorkspace: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState<TargetLanguage>('hi');
  const [engine, setEngine] = useState<TranslationEngine>('nmt');
  const [tone, setTone] = useState<TranslationTone>('neutral');

  const [isLoading, setIsLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<TranslationResultItem | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio synthesis state
  const [audioUrlNmt, setAudioUrlNmt] = useState<string | null>(null);
  const [audioUrlLlm, setAudioUrlLlm] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (text: string, label: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `translation_${targetLang}_${label.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClear = () => {
    setSourceText('');
    setSingleResult(null);
    setComparisonResult(null);
    setErrorMsg(null);
    setAudioUrlNmt(null);
    setAudioUrlLlm(null);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setAudioUrlNmt(null);
    setAudioUrlLlm(null);

    try {
      if (engine === 'compare') {
        const res = await compareTranslations(sourceText, targetLang, tone);
        setComparisonResult(res);
        setSingleResult(null);
      } else {
        const res = await translateText(sourceText, targetLang, engine, tone);
        if (res.results && res.results.length > 0) {
          setSingleResult(res.results[0]);
        }
        setComparisonResult(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeech = async (text: string, isLlm: boolean = false) => {
    setIsSynthesizing(true);
    try {
      const res = await generateSpeech(text, targetLang);
      if (isLlm) {
        setAudioUrlLlm(res.audio_url);
      } else {
        setAudioUrlNmt(res.audio_url);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Speech generation failed');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Source & Controls */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Target Language & Clear */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Language
                </span>
                <LanguageSelector value={targetLang} onChange={setTargetLang} />
              </div>
              {sourceText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Engine Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Translation Engine</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEngine('nmt')}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    engine === 'nmt'
                      ? 'bg-brand-50 border-brand-300 text-brand-800 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-brand-600" />
                  <span>MarianMT (NMT)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEngine('llm')}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    engine === 'llm'
                      ? 'bg-lavender-50 border-lavender-300 text-lavender-800 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-lavender-600" />
                  <span>LLM (Prompt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEngine('compare')}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    engine === 'compare'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Compare Both</span>
                </button>
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Tone & Register</label>
                {engine === 'nmt' && (
                  <span className="text-[10px] text-slate-400 italic">
                    (Tone conditioning primarily directs LLM generation)
                  </span>
                )}
              </div>
              <ToneSelector value={tone} onChange={setTone} />
            </div>

            {/* Source Textarea */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700">English Input Text</label>
                <span className="text-[11px] font-mono text-slate-400">{sourceText.length} / 5000</span>
              </div>
              <textarea
                rows={7}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Type or paste English sentence here... (e.g., The engineer completed the design specifications with exceptional accuracy.)"
                className="w-full text-sm p-4 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none resize-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim()}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Generating Translation...</span>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  <span>
                    Translate to {targetLang === 'hi' ? 'Hindi (हिन्दी)' : 'Marathi (मराठी)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Outputs */}
        <div className="lg:col-span-6 space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* SINGLE MODE OUTPUT */}
          {engine !== 'compare' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {targetLang === 'hi' ? 'Hindi Translation' : 'Marathi Translation'}
                    </span>
                    {singleResult && (
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                        {singleResult.engine.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {singleResult?.latency_ms !== undefined && (
                    <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
                      {singleResult.latency_ms} ms
                    </span>
                  )}
                </div>

                {singleResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-base font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">
                      {singleResult.translated_text}
                    </div>

                    <div className="text-xs text-slate-500 font-mono bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                      Checkpoint: {singleResult.model_name}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                    <Languages className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-xs">
                      Enter English text and press Translate to view results.
                    </p>
                  </div>
                )}
              </div>

              {singleResult && (
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <AudioPlayer
                    audioUrl={audioUrlNmt}
                    filename={`translation_${targetLang}.mp3`}
                    onGenerate={() => handleSpeech(singleResult.translated_text, false)}
                    isLoading={isSynthesizing}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(singleResult.translated_text, 'single')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      {copiedKey === 'single' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(singleResult.translated_text, singleResult.engine)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
                      title="Download as text file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMPARISON MODE (TWO CARDS) */}
          {engine === 'compare' && (
            <div className="space-y-4">
              {/* CARD A: MarianMT */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 card-shadow space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      Card A: Encoder–Decoder
                    </span>
                    <span className="text-xs font-semibold text-slate-700">MarianMT</span>
                  </div>
                  {comparisonResult?.nmt.latency_ms !== undefined && (
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border">
                      {comparisonResult.nmt.latency_ms} ms
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm font-medium text-slate-900 leading-relaxed min-h-[60px]">
                  {comparisonResult ? (
                    comparisonResult.nmt.translated_text
                  ) : (
                    <span className="text-slate-400 italic text-xs">Awaiting comparison run...</span>
                  )}
                </div>

                {comparisonResult && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                      {comparisonResult.nmt.model_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <AudioPlayer
                        audioUrl={audioUrlNmt}
                        filename={`marianmt_${targetLang}.mp3`}
                        onGenerate={() => handleSpeech(comparisonResult.nmt.translated_text, false)}
                        isLoading={isSynthesizing}
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(comparisonResult.nmt.translated_text, 'nmt')}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                      >
                        {copiedKey === 'nmt' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'nmt' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD B: LLM */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 card-shadow space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                      Card B: Large Language Model
                    </span>
                    <span className="text-xs font-semibold text-slate-700">Autoregressive</span>
                  </div>
                  {comparisonResult?.llm?.latency_ms !== undefined && (
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border">
                      {comparisonResult.llm.latency_ms} ms
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm font-medium text-slate-900 leading-relaxed min-h-[60px]">
                  {comparisonResult?.llm ? (
                    comparisonResult.llm.translated_text
                  ) : comparisonResult ? (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                      LLM generation unavailable (add LLM_API_KEY in backend/.env).
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Awaiting comparison run...</span>
                  )}
                </div>

                {comparisonResult?.llm && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                      {comparisonResult.llm.model_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <AudioPlayer
                        audioUrl={audioUrlLlm}
                        filename={`llm_${targetLang}.mp3`}
                        onGenerate={() => handleSpeech(comparisonResult.llm!.translated_text, true)}
                        isLoading={isSynthesizing}
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(comparisonResult.llm!.translated_text, 'llm')}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                      >
                        {copiedKey === 'llm' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'llm' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Analytical Difference Explanation */}
              {comparisonResult?.difference_explanation && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Info className="w-3.5 h-3.5 text-brand-600" />
                    <span>Comparative Output Analysis</span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {comparisonResult.difference_explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

