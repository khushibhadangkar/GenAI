import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Download,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  FileSpreadsheet,
  Cpu,
  Layers,
  Bot,
  Loader2,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import {
  EvaluationSentence,
  BleuScoreItem,
  EvaluationResultsResponse
} from '../types';
import {
  fetchEvaluationDataset,
  updateEvaluationReference,
  runEvaluation,
  fetchEvaluationResults,
  getEvaluationExportUrl
} from '../api/client';

export const EvaluationLabView: React.FC = () => {
  const [sentences, setSentences] = useState<EvaluationSentence[]>([]);
  const [scores, setScores] = useState<BleuScoreItem[]>([]);
  const [evalTimestamp, setEvalTimestamp] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Editable reference state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRefHi, setEditRefHi] = useState<string>('');
  const [editRefMr, setEditRefMr] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchEvaluationDataset();
      setSentences(data.sentences);

      const results = await fetchEvaluationResults();
      if (results && results.scores) {
        setScores(results.scores);
        setEvalTimestamp(results.timestamp);
      }
    } catch (e: any) {
      console.error(e);
      setStatusMsg(`Failed to load evaluation dataset: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartEdit = (s: EvaluationSentence) => {
    setEditingId(s.id);
    setEditRefHi(s.reference_hi);
    setEditRefMr(s.reference_mr);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await updateEvaluationReference(id, editRefHi, editRefMr);
      setSentences((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, reference_hi: editRefHi, reference_mr: editRefMr } : s
        )
      );
      setEditingId(null);
      setStatusMsg(`Saved updated references for sentence #${id}`);
    } catch (e: any) {
      setStatusMsg(`Failed to save reference: ${e.message}`);
    }
  };

  const handleRunBenchmark = async () => {
    setIsEvaluating(true);
    setStatusMsg(null);
    try {
      const results = await runEvaluation(['nmt', 'llm'], ['hi', 'mr']);
      setSentences(results.sentences);
      setScores(results.scores);
      setEvalTimestamp(results.timestamp);
      setStatusMsg(`Successfully evaluated ${results.total_sentences} sentences with SacreBLEU!`);
    } catch (e: any) {
      setStatusMsg(`Evaluation failed: ${e.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Prepare chart data comparing NMT vs LLM across Hindi & Marathi
  const chartData = [
    {
      language: 'Hindi',
      MarianMT: scores.find((s) => s.language === 'Hindi' && s.model.includes('MarianMT'))?.score || 0,
      LLM: scores.find((s) => s.language === 'Hindi' && s.model.includes('LLM'))?.score || 0
    },
    {
      language: 'Marathi',
      MarianMT: scores.find((s) => s.language === 'Marathi' && s.model.includes('MarianMT'))?.score || 0,
      LLM: scores.find((s) => s.language === 'Marathi' && s.model.includes('LLM'))?.score || 0
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Benchmark Runner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-100">
                Unit 4 Benchmark
              </span>
              <span className="text-xs text-slate-500 font-medium">Fixed 20-Sentence Testbed</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-brand-600" />
              Empirical BLEU Evaluation Lab
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard SacreBLEU evaluation for MarianMT encoder–decoder vs. LLM across Hindi and Marathi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRunBenchmark}
              disabled={isEvaluating}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating 20 Sentences...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Full Benchmark & SacreBLEU</span>
                </>
              )}
            </button>

            <a
              href={getEvaluationExportUrl()}
              download="lingua_ai_evaluation_results.csv"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Methodology and tokenization disclosure */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Info className="w-4 h-4 text-brand-600" />
            <span>SacreBLEU Protocol & Academic Compliance</span>
          </div>
          <p className="leading-relaxed">
            • <strong>Evaluation Metric:</strong> Standardized SacreBLEU with internationalized Devanagari subword / character tokenization (`intl`).
            <br />
            • <strong>Corpus Consistency:</strong> Identical 20 English source sentences with validated human reference translations.
            <br />
            • <strong>Separation of Concerns:</strong> Hindi and Marathi scores are computed separately to preserve target language morphological integrity.
          </p>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
            {statusMsg}
          </div>
        )}
      </div>

      {/* BLEU Scores Scorecards & Comparative Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scorecards */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Official BLEU Scorecards</h4>
            {evalTimestamp && (
              <span className="text-[11px] font-mono text-slate-400">
                {evalTimestamp.slice(0, 10)}
              </span>
            )}
          </div>

          {scores.length > 0 ? (
            <div className="space-y-3">
              {scores.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {item.language}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">{item.model}</h5>
                    <p className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]" title={item.signature}>
                      {item.signature}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-brand-700 tracking-tight">
                      {item.score}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                      BLEU
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
              No evaluation runs recorded yet. Click "Execute Full Benchmark & SacreBLEU" to run live models on the 20 sentences.
            </div>
          )}
        </div>

        {/* Comparison Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              SacreBLEU Model Comparison
            </h4>
            <span className="text-xs text-slate-500">Higher is better</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="language" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  formatter={(value: any) => [`${value} BLEU`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="MarianMT" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="LLM" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 20-Sentence Benchmark Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-900 text-base">
              20 Evaluation Sentences, Human References & Model Predictions
            </h4>
            <p className="text-xs text-slate-500">
              Inspect raw model generations and edit human references directly
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            Total Testbed: {sentences.length} sentences
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3 w-12">#</th>
                <th className="py-2.5 px-3 w-48">Source (English)</th>
                <th className="py-2.5 px-3 w-48">Hindi Reference</th>
                <th className="py-2.5 px-3 w-48">MarianMT Hindi</th>
                <th className="py-2.5 px-3 w-48">Marathi Reference</th>
                <th className="py-2.5 px-3 w-48">MarianMT Marathi</th>
                <th className="py-2.5 px-3 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sentences.map((s) => {
                const isEditing = editingId === s.id;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-500">{s.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-900 leading-relaxed">
                      {s.source}
                      <span className="block text-[10px] text-slate-400 mt-0.5">[{s.domain}]</span>
                    </td>

                    {/* Reference Hindi */}
                    <td className="py-3 px-3">
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={editRefHi}
                          onChange={(e) => setEditRefHi(e.target.value)}
                          className="w-full p-1.5 text-xs rounded border border-brand-300 font-medium"
                        />
                      ) : (
                        <span className="text-slate-800 leading-relaxed">{s.reference_hi}</span>
                      )}
                    </td>

                    {/* MarianMT Hindi Pred */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-blue-900 leading-relaxed">
                        {s.pred_nmt_hi || <span className="text-slate-400 font-normal italic">Pending run</span>}
                      </span>
                    </td>

                    {/* Reference Marathi */}
                    <td className="py-3 px-3">
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={editRefMr}
                          onChange={(e) => setEditRefMr(e.target.value)}
                          className="w-full p-1.5 text-xs rounded border border-brand-300 font-medium"
                        />
                      ) : (
                        <span className="text-slate-800 leading-relaxed">{s.reference_mr}</span>
                      )}
                    </td>

                    {/* MarianMT Marathi Pred */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-blue-900 leading-relaxed">
                        {s.pred_nmt_mr || <span className="text-slate-400 font-normal italic">Pending run</span>}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(s.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Save Reference"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit References"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

