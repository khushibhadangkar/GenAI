import React, { useState } from 'react';
import { X, Key, Bot, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { ModelStatusResponse } from '../../types';
import { updateModelConfig } from '../../api/client';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ModelStatusResponse | null;
  onConfigUpdated: (newStatus: ModelStatusResponse) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  status,
  onConfigUpdated
}) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(status?.llm_model || 'gpt-4o-mini');
  const [baseUrl, setBaseUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const presets = [
    { label: 'OpenAI (gpt-4o-mini)', model: 'gpt-4o-mini', baseUrl: '' },
    { label: 'Groq (llama-3.3-70b)', model: 'llama-3.3-70b-versatile', baseUrl: 'https://api.groq.com/openai/v1' },
    { label: 'OpenRouter (meta-llama)', model: 'meta-llama/llama-3.3-70b-instruct', baseUrl: 'https://openrouter.ai/api/v1' }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setModel(p.model);
    setBaseUrl(p.baseUrl);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const updated = await updateModelConfig({
        llm_api_key: apiKey || undefined,
        llm_model: model || undefined,
        llm_base_url: baseUrl || undefined
      });
      onConfigUpdated(updated);
      setMsg({ type: 'success', text: 'LLM configuration updated and saved successfully!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lavender-50 text-lavender-600 flex items-center justify-center border border-lavender-200">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Configure LLM Provider</h2>
              <p className="text-[11px] text-slate-500">Provide an API key for OpenAI, Groq, or OpenRouter</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              msg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {msg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Quick Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all ${
                    model === p.model
                      ? 'border-brand-500 bg-brand-50/50 text-brand-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {p.label.split(' ')[0]}
                  <span className="block text-[10px] text-slate-400 font-mono truncate">{p.model}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-slate-400" />
              <span>Model Identifier</span>
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. gpt-4o-mini or llama-3.3-70b-versatile"
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none font-mono"
            />
          </div>

          {/* API Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>API Key</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-... (never exposed in frontend code)"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none font-mono"
            />
            <p className="text-[10px] text-slate-400">
              Saved strictly to the backend environment and used solely for secure server-side proxy calls.
            </p>
          </div>

          {/* Custom Base URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Base URL (Optional for Groq/OpenRouter/Local vLLM)</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="e.g. https://api.groq.com/openai/v1 or leave empty for default OpenAI"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Connect</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

