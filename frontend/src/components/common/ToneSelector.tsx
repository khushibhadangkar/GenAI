import React from 'react';
import { TranslationTone } from '../../types';

interface ToneSelectorProps {
  value: TranslationTone;
  onChange: (tone: TranslationTone) => void;
  disabled?: boolean;
}

const tones: { id: TranslationTone; label: string; desc: string }[] = [
  { id: 'neutral', label: 'Neutral', desc: 'Standard Devanagari' },
  { id: 'formal', label: 'Formal', desc: 'Official / elevated' },
  { id: 'conversational', label: 'Conversational', desc: 'Natural spoken idioms' },
  { id: 'respectful', label: 'Respectful', desc: 'Honorific plural markers' },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tones.map((t) => {
        const isSelected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(t.id)}
            title={t.desc}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isSelected
                ? 'bg-lavender-50 border-lavender-300 text-lavender-700 shadow-2xs font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};

