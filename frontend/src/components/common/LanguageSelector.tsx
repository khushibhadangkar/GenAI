import React from 'react';
import { TargetLanguage } from '../../types';

interface LanguageSelectorProps {
  value: TargetLanguage;
  onChange: (lang: TargetLanguage) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 ${className}`}>
      <button
        type="button"
        onClick={() => onChange('hi')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          value === 'hi'
            ? 'bg-white text-brand-700 shadow-xs border border-slate-200/60'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Hindi (हिन्दी)
      </button>
      <button
        type="button"
        onClick={() => onChange('mr')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          value === 'mr'
            ? 'bg-white text-brand-700 shadow-xs border border-slate-200/60'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Marathi (मराठी)
      </button>
    </div>
  );
};

