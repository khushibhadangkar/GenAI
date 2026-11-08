import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Layers,
  Bot,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  Copy,
  Check
} from 'lucide-react';
import { TargetLanguage, TranslationTone, ComparisonResponse } from '../types';
import { compareTranslations } from '../api/client';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { ToneSelector } from '../components/common/ToneSelector';

interface HumanEvaluationRatings {
  meaningPreservation: string;
  grammaticalCorrectness: string;
  fluency: string;
  registerCompliance: string;
  genderHandling: string;
  evaluatorNotes: string;
}

const PRESET_SENTENCES = [
  "The professor explained the quantum physics principles to the attentive students.",
  "The senior doctor reviewed the clinical test reports before deciding the surgical treatment.",
  "Please ensure that all financial reports are submitted to the audit committee by Monday morning.",
  "The engineer arrived early and inspected the railway track infrastructure.",
  "Traditional folk music transcends regional boundaries and unites diverse communities."
];

export const ModelComparisonView: React.FC = () => {
  const [inputText, setInputText] = useState(PRESET_SENTENCES[0]);
  const [targetLang, setTargetLang] = useState<TargetLanguage>('hi');
  const [tone, setTone] = useState<TranslationTone>('formal');
  const [isLoading, setIsLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable Human Evaluation Table (clearly marked as human-reviewed)
  const [ratings, setRatings] = useState<HumanEvaluationRatings>({
    meaningPreservation: 'Equal',
    grammaticalCorrectness: 'MarianMT aligned',
    fluency: 'LLM more natural',
    registerCompliance: 'LLM follows tone',
    genderHandling: 'Requires review',
    evaluatorNotes: 'Observed that LLM incorporates formal honorific plural verb endings more consistently under formal tone.'
  });

  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  const handleRunComparison = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await compareTranslations(inputText, targetLang, tone);
      setComparison(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, card: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCard(card);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  // Automated 2.5-Min Demo Mode Trigger
  useEffect(() => {
    const handleDemoStep = async (e: any) => {
      if (e.detail?.step === 'model-comparison') {
        const demoSentence = PRESET_SENTENCES[0];
        setInputText(demoSentence);
        setTargetLang('hi');
        setTone('formal');
        setIsLoading(true);
        setErrorMsg(null);
        try {
          const res = await compareTranslations(demoSentence, 'hi', 'formal');
          setComparison(res);
        } catch (err: any) {
          console.warn('Demo model comparison fallback:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('lingua-demo-step', handleDemoStep);
    return () => window.removeEventListener('lingua-demo-step', handleDemoStep);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Architecture Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Encoder-Decoder Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
              Architecture 1
            </span>
            <span className="text-xs font-semibold text-slate-500">Dedicated Seq2Seq</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              Encoder–Decoder Translation (MarianMT)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Bidirectional Representation + Autoregressive Decoder</p>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <p>
              • <strong>Encoder:</strong> Processes the entire input sentence bidirectionally using self-attention, constructing contextual embeddings for each source subword token.
            </p>
            <p>
              • <strong>Decoder:</strong> Generates target Devanagari tokens sequentially, attending to both past generated tokens and the full encoded source representation.
            </p>
            <p>
              • <strong>Strengths:</strong> Highly constrained parameter space, deterministic translation mapping, fast inference speed, low memory footprint.
            </p>
          </div>
        </div>

        {/* LLM Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
              Architecture 2
            </span>
            <span className="text-xs font-semibold text-slate-500">Instruction-Guided</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-lavender-600" />
              Large Language Model Translation (LLM)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Causal Autoregressive Language Modeling</p>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <p>
              • <strong>Conditioning:</strong> Accepts natural language system instructions specifying vocabulary register, social tone, and target script formatting.
            </p>
            <p>
              • <strong>Generation:</strong> Predicts next tokens conditioned on both system guidelines and prior output tokens via causal masking.
            </p>
            <p>
              • <strong>Strengths:</strong> Exceptional register flexibility, honorific control, context disambiguation, zero-shot adaptation across diverse styles.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Input Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Comparison Workbench</h3>
          <div className="flex items-center gap-3">
            <LanguageSelector value={targetLang} onChange={setTargetLang} />
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Sample Academic Benchmarks:</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_SENTENCES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border text-left transition-all truncate max-w-xs ${
                  inputText === preset
                    ? 'bg-brand-50 border-brand-300 text-brand-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Sentence {idx + 1}: {preset.slice(0, 32)}...
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Area */}
        <div className="space-y-1.5">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter an English sentence to run through both architectures simultaneously..."
            className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none resize-none transition-all font-medium text-slate-800"
          />
        </div>

        {/* Tone Selector & Run Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-600 block">LLM Target Tone:</span>
            <ToneSelector value={tone} onChange={setTone} />
          </div>

          <button
            type="button"
            onClick={handleRunComparison}
            disabled={isLoading || !inputText.trim()}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <GitCompare className="w-4 h-4 text-brand-400" />
            <span>{isLoading ? 'Running Dual Inference...' : 'Execute Side-by-Side Comparison'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Side-by-Side Live Outputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MarianMT Output Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                MarianMT
              </span>
              <span className="text-xs font-medium text-slate-500">
                {targetLang === 'hi' ? 'opus-mt-en-hi' : 'opus-mt-en-mr'}
              </span>
            </div>
            {comparison?.nmt.latency_ms !== undefined && (
              <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border">
                {comparison.nmt.latency_ms} ms
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-base font-semibold text-slate-900 leading-relaxed min-h-[100px]">
            {comparison ? (
              comparison.nmt.translated_text
            ) : (
              <span className="text-slate-400 italic text-xs font-normal">
                Click "Execute Side-by-Side Comparison" above to generate output.
              </span>
            )}
          </div>

          {comparison && (
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                {comparison.nmt.translated_text.length} chars
              </span>
              <button
                type="button"
                onClick={() => handleCopy(comparison.nmt.translated_text, 'nmt_comp')}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedCard === 'nmt_comp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCard === 'nmt_comp' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* LLM Output Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                Large Language Model
              </span>
              <span className="text-xs font-medium text-slate-500">
                Tone: {tone}
              </span>
            </div>
            {comparison?.llm?.latency_ms !== undefined && (
              <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border">
                {comparison.llm.latency_ms} ms
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-base font-semibold text-slate-900 leading-relaxed min-h-[100px]">
            {comparison?.llm ? (
              comparison.llm.translated_text
            ) : comparison ? (
              <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200/60">
                LLM translation is not currently configured. Set LLM_API_KEY in backend/.env to inspect live LLM responses.
              </div>
            ) : (
              <span className="text-slate-400 italic text-xs font-normal">
                Click "Execute Side-by-Side Comparison" above to generate output.
              </span>
            )}
          </div>

          {comparison?.llm && (
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                {comparison.llm.translated_text.length} chars
              </span>
              <button
                type="button"
                onClick={() => handleCopy(comparison.llm!.translated_text, 'llm_comp')}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedCard === 'llm_comp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCard === 'llm_comp' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Human Qualitative Evaluation Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600" />
              Human Qualitative Evaluation Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Annotated academic rubric comparing Seq2Seq vs LLM generation (Human Reviewed)
            </p>
          </div>
          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200/60 self-start sm:self-auto">
            Editable Human Review Fields
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Evaluation Dimension</th>
                <th className="py-2.5 px-3">MarianMT (Seq2Seq)</th>
                <th className="py-2.5 px-3">LLM (Generative)</th>
                <th className="py-2.5 px-3">Annotated Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Meaning Preservation</td>
                <td className="py-3 px-3">Direct literal semantic transfer</td>
                <td className="py-3 px-3">Contextual paraphrasing</td>
                <td className="py-3 px-3">
                  <input
                    type="text"
                    value={ratings.meaningPreservation}
                    onChange={(e) => setRatings({ ...ratings, meaningPreservation: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
                  />
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Grammatical Correctness</td>
                <td className="py-3 px-3">Strict parallel corpus alignment</td>
                <td className="py-3 px-3">Robust morphosyntax</td>
                <td className="py-3 px-3">
                  <input
                    type="text"
                    value={ratings.grammaticalCorrectness}
                    onChange={(e) => setRatings({ ...ratings, grammaticalCorrectness: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
                  />
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Fluency & Naturalness</td>
                <td className="py-3 px-3">May sound formulaic on complex syntax</td>
                <td className="py-3 px-3">High conversational idiomatic fluency</td>
                <td className="py-3 px-3">
                  <input
                    type="text"
                    value={ratings.fluency}
                    onChange={(e) => setRatings({ ...ratings, fluency: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
                  />
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Register & Tone Control</td>
                <td className="py-3 px-3">Fixed static register from training data</td>
                <td className="py-3 px-3">Dynamically steers honorifics & formality</td>
                <td className="py-3 px-3">
                  <input
                    type="text"
                    value={ratings.registerCompliance}
                    onChange={(e) => setRatings({ ...ratings, registerCompliance: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
                  />
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Gender & Morphology</td>
                <td className="py-3 px-3">Often defaults to masculine verb agreement</td>
                <td className="py-3 px-3">Can adopt neutral/honorific plural forms</td>
                <td className="py-3 px-3">
                  <input
                    type="text"
                    value={ratings.genderHandling}
                    onChange={(e) => setRatings({ ...ratings, genderHandling: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Reviewer Overall Commentary */}
        <div className="pt-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Reviewer Synthesis Notes:</label>
          <textarea
            rows={2}
            value={ratings.evaluatorNotes}
            onChange={(e) => setRatings({ ...ratings, evaluatorNotes: e.target.value })}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
};

