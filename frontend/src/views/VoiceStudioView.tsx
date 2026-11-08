import React, { useState } from 'react';
import {
  Volume2,
  Sparkles,
  Download,
  Play,
  Pause,
  AlertCircle,
  Loader2,
  Mic,
  Languages
} from 'lucide-react';
import { TargetLanguage } from '../types';
import { generateSpeech } from '../api/client';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { AudioPlayer } from '../components/common/AudioPlayer';

const SAMPLE_TEXTS = {
  hi: [
    "नमस्ते! लिंगुआ एआई अनुवाद और वाक् संश्लेषण मंच में आपका स्वागत है।",
    "कृत्रिम बुद्धिमत्ता भविष्य में शिक्षा और अनुसंधान के क्षेत्र में क्रांतिकारी परिवर्तन ला रही है।",
    "कृपया अपनी यात्रा के दौरान सभी सुरक्षा नियमों का सावधानीपूर्वक पालन करें।"
  ],
  mr: [
    "नमस्कार! लिंगुआ एआय भाषांतर आणि व्हॉईस स्टुडिओमध्ये आपले सहर्ष स्वागत आहे.",
    "कृत्रिम बुद्धिमत्ता आधुनिक जगातील शिक्षण आणि तंत्रज्ञानात मोलाची भूमिका बजावत आहे.",
    "कृपया आपल्या प्रवासादरम्यान सर्व सुरक्षिततेच्या नियमांचे काटेकोरपणे पालन करा."
  ]
};

export const VoiceStudioView: React.FC = () => {
  const [targetLang, setTargetLang] = useState<TargetLanguage>('hi');
  const [inputText, setInputText] = useState(SAMPLE_TEXTS.hi[0]);
  const [isSlow, setIsSlow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('speech.mp3');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLangChange = (lang: TargetLanguage) => {
    setTargetLang(lang);
    setInputText(SAMPLE_TEXTS[lang][0]);
    setAudioUrl(null);
  };

  const handleSynthesize = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await generateSpeech(inputText, targetLang, isSlow);
      setAudioUrl(res.audio_url);
      setFilename(res.filename);
    } catch (err: any) {
      setErrorMsg(err.message || 'Speech generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Studio Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-brand-600" />
              Indic Speech Synthesis Engine
            </h3>
            <p className="text-xs text-slate-500">
              Verified native acoustic models for Devanagari Hindi and Marathi
            </p>
          </div>
          <LanguageSelector value={targetLang} onChange={handleLangChange} />
        </div>

        {/* Quick Sample Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Sample Devanagari Prompts:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TEXTS[targetLang].map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(sample)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border text-left transition-all truncate max-w-sm ${
                  inputText === sample
                    ? 'bg-brand-50 border-brand-300 text-brand-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Sample {idx + 1}: {sample.slice(0, 35)}...
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700">
              Text to Synthesize ({targetLang === 'hi' ? 'Hindi Script' : 'Marathi Script'})
            </label>
            <span className="text-[11px] font-mono text-slate-400">{inputText.length} chars</span>
          </div>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Enter ${targetLang === 'hi' ? 'Hindi' : 'Marathi'} text here...`}
            className="w-full text-sm p-4 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none resize-none transition-all font-medium text-slate-800"
          />
        </div>

        {/* Voice Parameters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isSlow}
                onChange={(e) => setIsSlow(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span>Slow Speech Pace (Educational/Accessibility)</span>
            </label>

            <span className="text-xs text-slate-400 font-mono">
              Voice: {targetLang === 'hi' ? 'hi-IN (Devanagari)' : 'mr-IN (Devanagari)'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSynthesize}
            disabled={isLoading || !inputText.trim()}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Voice...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Synthesize Audio</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Audio Playback & Download Card */}
      {audioUrl && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-sm">Synthesized Audio Output</h4>
            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Ready for Playback
            </span>
          </div>

          <AudioPlayer audioUrl={audioUrl} filename={filename} />

          <p className="text-[11px] text-slate-500 italic">
            Audio file cached locally on backend for streaming and download. Click the download icon to save as MP3.
          </p>
        </div>
      )}
    </div>
  );
};

