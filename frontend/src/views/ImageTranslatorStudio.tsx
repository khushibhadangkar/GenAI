import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Languages,
  Edit3,
  Check,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { TargetLanguage, TranslationEngine, TranslationResultItem } from '../types';
import { generateCaption, translateCaption, generateSpeech } from '../api/client';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { AudioPlayer } from '../components/common/AudioPlayer';

export const ImageTranslatorStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [isCaptioning, setIsCaptioning] = useState<boolean>(false);
  const [captionLatency, setCaptionLatency] = useState<number | null>(null);

  const [targetLang, setTargetLang] = useState<TargetLanguage>('hi');
  const [engine, setEngine] = useState<TranslationEngine>('nmt');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedResult, setTranslatedResult] = useState<TranslationResultItem | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload JPG, PNG, or WebP images.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit.');
      return;
    }

    setErrorMsg(null);
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCaption('');
    setCaptionLatency(null);
    setTranslatedResult(null);
    setAudioUrl(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerateCaption = async () => {
    if (!selectedImage) return;
    setIsCaptioning(true);
    setErrorMsg(null);
    setTranslatedResult(null);
    setAudioUrl(null);

    try {
      const res = await generateCaption(selectedImage);
      setCaption(res.caption);
      setCaptionLatency(res.latency_ms);
    } catch (err: any) {
      setErrorMsg(err.message || 'Image captioning failed');
    } finally {
      setIsCaptioning(false);
    }
  };

  const handleTranslateCaption = async () => {
    if (!caption.trim()) return;
    setIsTranslating(true);
    setErrorMsg(null);
    setAudioUrl(null);

    try {
      const res = await translateCaption(caption, targetLang, engine, 'neutral');
      setTranslatedResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Caption translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeech = async () => {
    if (!translatedResult?.translated_text) return;
    setIsSynthesizing(true);
    try {
      const res = await generateSpeech(translatedResult.translated_text, targetLang);
      setAudioUrl(res.audio_url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Speech generation failed');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Visual Pipeline Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 card-shadow">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Multimodal Translation Pipeline
        </span>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
            selectedImage ? 'bg-brand-50 border-brand-200 text-brand-800' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <ImageIcon className="w-3.5 h-3.5" />
            <span>1. Visual Input</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
            caption ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. BLIP Vision-to-Text</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
            caption ? 'bg-lavender-50 border-lavender-200 text-lavender-800' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <Edit3 className="w-3.5 h-3.5" />
            <span>3. English Caption</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
            translatedResult ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <Languages className="w-3.5 h-3.5" />
            <span>4. Target Language ({targetLang === 'hi' ? 'Hindi' : 'Marathi'})</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Upload & Preview */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Image Source</h3>
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl(null);
                    setCaption('');
                    setTranslatedResult(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Sample Demo Images */}
            <div className="space-y-1.5 mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Sample Demo Images (1-Click)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Classroom', path: '/samples/classroom.jpg', desc: 'Classroom lecture' },
                  { name: 'Railway Station', path: '/samples/railway_station.jpg', desc: 'Train platform' },
                  { name: 'Mountain Lake', path: '/samples/mountains.jpg', desc: 'Scenic mountains' }
                ].map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch(sample.path);
                        const blob = await res.blob();
                        const file = new File([blob], `${sample.name.toLowerCase().replace(/\s+/g, '_')}.jpg`, { type: 'image/jpeg' });
                        handleFile(file);
                      } catch (err) {
                        console.error('Failed to load sample image', err);
                      }
                    }}
                    className="p-1.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-slate-50/50 hover:bg-brand-50/30 text-left transition-all group"
                  >
                    <img
                      src={sample.path}
                      alt={sample.name}
                      className="w-full h-12 object-cover rounded-lg border border-slate-200/80 mb-1"
                    />
                    <div className="text-[11px] font-semibold text-slate-700 group-hover:text-brand-900 truncate">
                      {sample.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                previewUrl
                  ? 'border-slate-200 bg-slate-50/50'
                  : 'border-slate-300 hover:border-brand-500 hover:bg-brand-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-60 w-auto mx-auto rounded-xl object-contain shadow-xs border border-slate-200/80"
                  />
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedImage?.name} ({(selectedImage!.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              ) : (
                <div className="space-y-2 py-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                      Click to upload
                    </span>
                    <span className="text-xs text-slate-500"> or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    PNG, JPG, JPEG, or WebP up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateCaption}
              disabled={!selectedImage || isCaptioning}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isCaptioning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Generating BLIP Caption...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Generate English Caption</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: Caption & Target Translation */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Caption Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                  <span>BLIP English Caption (Editable)</span>
                </label>
                {captionLatency !== null && (
                  <span className="text-[11px] font-mono text-slate-400">
                    BLIP Latency: {captionLatency} ms
                  </span>
                )}
              </div>

              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="BLIP generated description will appear here. You can refine or edit it before translation."
                className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none resize-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
              />
            </div>

            {/* Translation Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Target Language:</span>
                  <LanguageSelector value={targetLang} onChange={setTargetLang} />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Model:</span>
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setEngine('nmt')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        engine === 'nmt' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600'
                      }`}
                    >
                      MarianMT
                    </button>
                    <button
                      type="button"
                      onClick={() => setEngine('llm')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        engine === 'llm' ? 'bg-lavender-50 text-lavender-700 font-bold' : 'text-slate-600'
                      }`}
                    >
                      LLM
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTranslateCaption}
                disabled={!caption.trim() || isTranslating}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Translating Caption...</span>
                  </>
                ) : (
                  <>
                    <Languages className="w-3.5 h-3.5" />
                    <span>Translate Caption to {targetLang === 'hi' ? 'Hindi' : 'Marathi'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Translated Output Card */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Translated Caption ({targetLang === 'hi' ? 'Hindi / हिन्दी' : 'Marathi / मराठी'})
                </label>
                {translatedResult?.latency_ms !== undefined && (
                  <span className="text-[11px] font-mono text-slate-400">
                    MT Latency: {translatedResult.latency_ms} ms
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-base font-semibold text-slate-900 leading-relaxed min-h-[90px] shadow-2xs">
                {translatedResult ? (
                  translatedResult.translated_text
                ) : (
                  <span className="text-slate-400 italic text-xs font-normal">
                    Translated caption will appear here once caption is generated and translated.
                  </span>
                )}
              </div>
            </div>
          </div>

          {translatedResult && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <AudioPlayer
                audioUrl={audioUrl}
                filename={`caption_${targetLang}.mp3`}
                onGenerate={handleSpeech}
                isLoading={isSynthesizing}
              />
              <span className="text-[11px] font-mono text-slate-400">
                {translatedResult.model_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

