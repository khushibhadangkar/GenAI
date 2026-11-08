import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  BarChart2,
  FileSpreadsheet,
  HelpCircle,
  Save,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BiasCaseItem, BiasResultsResponse } from '../types';
import {
  fetchBiasResults,
  runBiasTranslations,
  updateBiasObservation,
  getBiasExportUrl
} from '../api/client';

const CATEGORIES = [
  "Gender explicitly present in source",
  "Gender required by target-language grammar",
  "Unsupported gender inference",
  "Occupational stereotype",
  "Incorrect gender agreement",
  "Ambiguous result"
];

const CATEGORY_COLORS: Record<string, string> = {
  "Gender explicitly present in source": "#3b82f6",
  "Gender required by target-language grammar": "#64748b",
  "Unsupported gender inference": "#f59e0b",
  "Occupational stereotype": "#ef4444",
  "Incorrect gender agreement": "#ec4899",
  "Ambiguous result": "#8b5cf6"
};

export const BiasAnalysisView: React.FC = () => {
  const [cases, setCases] = useState<BiasCaseItem[]>([]);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [reviewedCount, setReviewedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(10);
  const [selectedCaseId, setSelectedCaseId] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [reviewerNotes, setReviewerNotes] = useState<string>('');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchBiasResults();
      setCases(res.cases);
      setDistribution(res.category_distribution);
      setReviewedCount(res.reviewed_count);
      setTotalCount(res.total_count);

      // Select initial case
      const current = res.cases.find((c) => c.id === selectedCaseId) || res.cases[0];
      if (current) {
        setSelectedCaseId(current.id);
        setActiveCategory(current.category || CATEGORIES[0]);
        setReviewerNotes(current.reviewer_notes || '');
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCase = (c: BiasCaseItem) => {
    setSelectedCaseId(c.id);
    setActiveCategory(c.category || CATEGORIES[0]);
    setReviewerNotes(c.reviewer_notes || '');
    setStatusMsg(null);
  };

  const handleRunAll = async () => {
    setIsRunning(true);
    setStatusMsg(null);
    try {
      const updatedCases = await runBiasTranslations();
      setCases(updatedCases);
      setStatusMsg('Translations generated for all 10 bias benchmark sentences!');
      await loadData();
    } catch (e: any) {
      setStatusMsg(`Generation error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveObservation = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      await updateBiasObservation(selectedCaseId, activeCategory, reviewerNotes);
      setStatusMsg(`Record #${selectedCaseId} saved and marked as reviewed.`);
      await loadData();
    } catch (e: any) {
      setStatusMsg(`Update failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Chart data from real distribution
  const chartData = Object.entries(distribution).map(([cat, count]) => ({
    name: cat,
    count: count
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Scale className="w-5 h-5 text-brand-600" />
              Gender-Bias & Morphological Agreement Protocol
            </h3>
            <p className="text-xs text-slate-500">
              Assessing whether MT and LLMs inject stereotypical gender defaults into gender-neutral professions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunAll}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating Test Cases...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Predictions (NMT & LLM)</span>
                </>
              )}
            </button>

            <a
              href={getBiasExportUrl()}
              download="lingua_ai_gender_bias_analysis.csv"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Methodology notice */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
            Linguistic Ground Rule:
          </p>
          <p className="leading-relaxed">
            Hindi and Marathi have grammatical gender requiring verbs, adjectives, and postpositions to agree with masculine, feminine (and in Marathi, neuter) nouns.
            <strong> Do not automatically classify every gendered inflected sentence as bias.</strong> Distinguish legitimate grammatical necessity from unsupported occupational stereotyping.
          </p>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Two Column Workspace: Case List + Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: 10 Case Selector */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 card-shadow space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              10 Profession Cases
            </span>
            <span className="text-xs font-mono font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
              {reviewedCount} / {totalCount} Reviewed
            </span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {cases.map((c) => {
              const isSelected = c.id === selectedCaseId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCase(c)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-brand-50/80 border-brand-300 text-brand-900 shadow-2xs'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">Case #{c.id} ({c.profession})</span>
                    {c.reviewed ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Reviewed
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Pending</span>
                    )}
                  </div>
                  <p className="truncate font-medium text-slate-800">{c.source}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Detailed Inspector & Review Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-5">
          {selectedCase && (
            <div className="space-y-5">
              {/* Case Source & Grammatical Context */}
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Case #{selectedCase.id} • Profession: {selectedCase.profession}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                    selectedCase.explicit_gender ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    Explicit Gender: {selectedCase.explicit_gender ? `Yes (${selectedCase.gender})` : 'No (Neutral)'}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 leading-snug">
                  "{selectedCase.source}"
                </h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                  <strong>Linguistic note:</strong> {selectedCase.grammatical_note}
                </p>
              </div>

              {/* Translation Predictions Side-by-Side */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Model Outputs Comparison
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Hindi MarianMT */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                    <span className="text-[11px] font-bold text-blue-700 uppercase">
                      MarianMT → Hindi
                    </span>
                    <p className="text-sm font-semibold text-slate-900 min-h-[36px]">
                      {selectedCase.nmt_hi || <span className="text-slate-400 italic text-xs">Run predictions to populate</span>}
                    </p>
                  </div>

                  {/* Hindi LLM */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                    <span className="text-[11px] font-bold text-purple-700 uppercase">
                      LLM → Hindi
                    </span>
                    <p className="text-sm font-semibold text-slate-900 min-h-[36px]">
                      {selectedCase.llm_hi || <span className="text-slate-400 italic text-xs">Run predictions to populate</span>}
                    </p>
                  </div>

                  {/* Marathi MarianMT */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                    <span className="text-[11px] font-bold text-blue-700 uppercase">
                      MarianMT → Marathi
                    </span>
                    <p className="text-sm font-semibold text-slate-900 min-h-[36px]">
                      {selectedCase.nmt_mr || <span className="text-slate-400 italic text-xs">Run predictions to populate</span>}
                    </p>
                  </div>

                  {/* Marathi LLM */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                    <span className="text-[11px] font-bold text-purple-700 uppercase">
                      LLM → Marathi
                    </span>
                    <p className="text-sm font-semibold text-slate-900 min-h-[36px]">
                      {selectedCase.llm_mr || <span className="text-slate-400 italic text-xs">Run predictions to populate</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviewer Annotation Controls */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Reviewer Observation & Categorization
                </span>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Classification Category:</label>
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  >
                    {CATEGORIES.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Reviewer Empirical Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Record linguistic observations (e.g. MarianMT defaulted to masculine verb 'पहुँचा' for neutral English 'engineer', while LLM produced honorific plural 'पहुंचे')..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 outline-none resize-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveObservation}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Record Observation'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actual Reviewed Distribution Chart */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-600" />
              Empirical Category Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Calculated exclusively from actual reviewer annotations across the 10 profession test cases
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            Reviewed: {reviewedCount} of {totalCount}
          </span>
        </div>

        {reviewedCount > 0 ? (
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 160, bottom: 5 }}>
                <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={150} />
                <Tooltip
                  formatter={(val: any) => [`${val} sentence(s)`, 'Count']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            No reviewed categories recorded yet. Select test cases above, record reviewer observations, and save to populate empirical distribution metrics.
          </div>
        )}
      </div>
    </div>
  );
};

