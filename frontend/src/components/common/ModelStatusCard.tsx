import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

interface ModelStatusCardProps {
  title: string;
  architecture: string;
  modelId: string;
  isReady: boolean;
  type: 'nmt' | 'llm' | 'vision' | 'audio';
  details: string;
  badge?: string;
}

export const ModelStatusCard: React.FC<ModelStatusCardProps> = ({
  title,
  architecture,
  modelId,
  isReady,
  type,
  details,
  badge
}) => {
  const typeColors = {
    nmt: 'border-blue-200 bg-blue-50/30 text-blue-700',
    llm: 'border-purple-200 bg-purple-50/30 text-purple-700',
    vision: 'border-amber-200 bg-amber-50/30 text-amber-700',
    audio: 'border-emerald-200 bg-emerald-50/30 text-emerald-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 card-shadow card-hover flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${typeColors[type]}`}>
              {architecture}
            </span>
            {badge && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isReady ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <AlertCircle className="w-3 h-3" /> Config Required
              </span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-slate-900 text-base mb-1">{title}</h3>
        <p className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60 break-all mb-3">
          {modelId}
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">{details}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-slate-400" /> Latency Optimized
        </span>
        <span className="font-medium text-slate-700">Verified Integration</span>
      </div>
    </div>
  );
};

