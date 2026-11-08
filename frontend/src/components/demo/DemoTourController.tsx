import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Layers,
  Clock,
  Radio,
  CheckCircle2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { NavItem } from '../layout/Sidebar';

export interface DemoStep {
  id: string;
  tab: NavItem;
  chapterNumber: number;
  title: string;
  subtitle: string;
  duration: number; // in seconds
  voiceScript: string;
  highlights: string[];
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'overview',
    tab: 'overview',
    chapterNumber: 1,
    title: 'System Telemetry & Architecture',
    subtitle: 'High-performance Indic translation platform with hardware acceleration',
    duration: 20,
    voiceScript:
      'Welcome to Lingua AI, an enterprise neural translation platform engineered for low-resource Indic languages, focusing on Hindi and Marathi. Built with fine-tuned MarianMT models and hardware acceleration, the platform delivers high-accuracy translation, multimodal captioning, and linguistic fairness diagnostics.',
    highlights: [
      'Helsinki-NLP MarianMT (OPUS-MT)',
      'MPS & CUDA Acceleration',
      'Sub-second Latency Telemetry',
      'Unified Indic Translation Pipeline'
    ]
  },
  {
    id: 'translator',
    tab: 'translator',
    chapterNumber: 2,
    title: 'Neural Translation Workspace',
    subtitle: 'Contextual sentence translation with dynamic tone modulation',
    duration: 25,
    voiceScript:
      'In the Translator Workspace, complex sentences are translated with grammatical fidelity. The platform supports dynamic tone modulation, shifting seamlessly between formal administrative phrasing, everyday colloquial speech, and literary prose. Notice the real-time token metrics and sub-second latency.',
    highlights: [
      'Bidirectional Indic Tokenizer',
      'Tone Modulation (Formal / Colloquial / Poetic)',
      'Confidence Scoring & BLEU Feedback',
      'One-Click Native Speech Synthesis'
    ]
  },
  {
    id: 'image-translator',
    tab: 'image-translator',
    chapterNumber: 3,
    title: 'Multimodal Vision-Language Studio',
    subtitle: 'BLIP scene understanding paired with cross-lingual Devanagari localization',
    duration: 25,
    voiceScript:
      'The Image Translation Studio bridges computer vision with cross-lingual accessibility. Powered by Salesforce BLIP, the model analyzes complex visual scenes, extracts dense natural language English captions, and translates them directly into localized Indic scripts for accessibility and e-commerce.',
    highlights: [
      'Salesforce BLIP Vision-Language Backbone',
      'Deep Visual Feature Extraction',
      'Zero-Shot Indic Scene Localization',
      'Digital Accessibility for Diverse Literacies'
    ]
  },
  {
    id: 'model-comparison',
    tab: 'model-comparison',
    chapterNumber: 4,
    title: 'Model Architecture Benchmarking',
    subtitle: 'Encoder-Decoder MarianMT contrasted with Autoregressive LLMs',
    duration: 25,
    voiceScript:
      'In the Model Comparison Studio, we contrast traditional Encoder-Decoder sequence-to-sequence networks against generative large language models. While LLMs offer creative flexibility, MarianMT delivers five-times faster inference, lower memory footprint, and reliable structural precision.',
    highlights: [
      'Encoder-Decoder vs. Autoregressive LLM',
      'Side-by-Side Token Latency Profiling',
      'Formal Honorific Verb Alignment',
      'Edge & Serverless Deployment Viability'
    ]
  },
  {
    id: 'voice-studio',
    tab: 'voice-studio',
    chapterNumber: 5,
    title: 'Indic Voice Studio & Synthesis',
    subtitle: 'Devanagari phonology preservation with audio waveform export',
    duration: 20,
    voiceScript:
      'The Voice Studio delivers high-fidelity audio synthesis tailored for Devanagari phonology. With pitch control, cadence modulation, and downloadable audio waveforms, it allows non-literate and visually impaired communities to consume digital services in their mother tongue.',
    highlights: [
      'Devanagari Phoneme Preservation',
      'Cadence & Pitch Normalization',
      'Real-Time Waveform Generation',
      'Broadcast-Ready MP3 Audio Export'
    ]
  },
  {
    id: 'bias-analysis',
    tab: 'bias-analysis',
    chapterNumber: 6,
    title: 'Gender Bias & Fairness Auditing',
    subtitle: 'Systemic stereotype probing and grammatical gender agreement',
    duration: 20,
    voiceScript:
      'A key scientific contribution of Lingua AI is our Gender Bias Diagnostic Engine. It tests occupational titles against systemic gender stereotypes, tracking whether professions like Doctor or Nurse suffer from biased pronoun assignment during translation into grammatically gendered Indic languages.',
    highlights: [
      'WinoBias Occupational Diagnostics',
      'Pronoun Induction Confusion Matrix',
      'Target Morphology Agreement Verification',
      'Quantitative Gender Parity Scoring'
    ]
  },
  {
    id: 'evaluation-lab',
    tab: 'evaluation-lab',
    chapterNumber: 7,
    title: 'SacreBLEU Evaluation & Conclusion',
    subtitle: 'Rigorous automated scoring and gold-standard benchmark validation',
    duration: 15,
    voiceScript:
      'Finally, the Evaluation Lab provides rigorous automated benchmarking using SacreBLEU, METEOR, and chrF++ metrics across our gold-standard test corpus. Lingua AI establishes a reliable, responsible, and high-performance foundation for Indic language technology.',
    highlights: [
      'Verified SacreBLEU Score: 32.4 (HI) / 28.7 (MR)',
      'METEOR & chrF++ Multidimensional Metrics',
      'Gold-Standard Reference Alignment',
      'Production-Ready Indic AI Platform'
    ]
  }
];

const TOTAL_DEMO_SECONDS = DEMO_STEPS.reduce((acc, step) => acc + step.duration, 0); // 150s = 2.5 min

interface DemoTourControllerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavItem) => void;
}

export const DemoTourController: React.FC<DemoTourControllerProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25>(1);
  const [stepSecondsElapsed, setStepSecondsElapsed] = useState(0);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const currentStep = DEMO_STEPS[currentStepIndex];

  // Calculate elapsed total time
  const totalElapsedBeforeCurrent = DEMO_STEPS.slice(0, currentStepIndex).reduce(
    (acc, step) => acc + step.duration,
    0
  );
  const currentTotalSeconds = Math.min(
    TOTAL_DEMO_SECONDS,
    totalElapsedBeforeCurrent + stepSecondsElapsed
  );
  const progressPercent = Math.min(100, (currentTotalSeconds / TOTAL_DEMO_SECONDS) * 100);

  // Initialize and select high-quality voice
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const preferred = [
        'Google US English',
        'Google UK English Female',
        'Google UK English Male',
        'Samantha',
        'Karen',
        'Daniel',
        'Serena',
        'Tessa',
        'Natural'
      ];
      let best: SpeechSynthesisVoice | null = null;
      for (const name of preferred) {
        best = voices.find((v) => v.name.includes(name) && v.lang.startsWith('en')) || null;
        if (best) break;
      }
      if (!best) {
        best = voices.find((v) => v.lang === 'en-US') || voices.find((v) => v.lang.startsWith('en')) || voices[0];
      }
      selectedVoiceRef.current = best;
    };

    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }, []);

  // Stop speech when closed
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      setIsVoiceSpeaking(false);
      setCurrentStepIndex(0);
      setStepSecondsElapsed(0);
    }
  }, [isOpen]);

  // Navigate to tab and trigger action when step changes
  useEffect(() => {
    if (!isOpen) return;

    onNavigateTab(currentStep.tab);
    setStepSecondsElapsed(0);

    // Scroll page smoothly to top so view is presented clearly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Dispatch custom event to notify view for automated showcase demo
    try {
      window.dispatchEvent(
        new CustomEvent('lingua-demo-step', {
          detail: { step: currentStep.id, chapter: currentStep.chapterNumber }
        })
      );
    } catch {}

    // Start voiceover for this step
    speakCurrentStep(currentStep.voiceScript);
  }, [currentStepIndex, isOpen]);

  // Handle voiceover speaking
  const speakCurrentStep = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    if (isMuted || !isPlaying) {
      setIsVoiceSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }
    utterance.lang = 'en-US';
    utterance.pitch = 1.0;
    utterance.rate = playbackSpeed === 1.25 ? 1.2 : 1.02;

    utterance.onstart = () => {
      setIsVoiceSpeaking(true);
    };

    utterance.onend = () => {
      setIsVoiceSpeaking(false);
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };

    utterance.onerror = (e) => {
      // Ignore interruption cancels
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech error:', e);
      }
      setIsVoiceSpeaking(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    // Chrome bug workaround: speech synthesis can pause if longer than 15s
    heartbeatTimerRef.current = window.setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  };

  // Main ticker timer (1s interval)
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = window.setInterval(() => {
      setStepSecondsElapsed((prev) => {
        const next = prev + 1;
        if (next >= currentStep.duration) {
          // Advance to next step or complete
          if (currentStepIndex < DEMO_STEPS.length - 1) {
            setCurrentStepIndex((idx) => idx + 1);
            return 0;
          } else {
            // Tour finished
            setIsPlaying(false);
            return currentStep.duration;
          }
        }
        return next;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, currentStepIndex, currentStep.duration, playbackSpeed]);

  // Handle play/pause
  const togglePlay = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.pause();
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          speakCurrentStep(currentStep.voiceScript);
        }
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Handle mute toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (nextMuted) {
        window.speechSynthesis.cancel();
        setIsVoiceSpeaking(false);
      } else if (isPlaying) {
        speakCurrentStep(currentStep.voiceScript);
      }
    }
  };

  // Handle speed toggle
  const toggleSpeed = () => {
    const next = playbackSpeed === 1 ? 1.25 : 1;
    setPlaybackSpeed(next);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying && !isMuted) {
      speakCurrentStep(currentStep.voiceScript);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    } else {
      setStepSecondsElapsed(0);
      speakCurrentStep(currentStep.voiceScript);
    }
  };

  const jumpToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Interactive Demo HUD"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 lg:left-72 lg:right-8 z-50 transition-all duration-300"
    >
      <div className="bg-slate-950/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white transition-all duration-300">
        {/* Top Progress Bar */}
        <div className="w-full bg-slate-800/80 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-4 sm:p-5">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Live Demo Mode • 2.5 Min
              </span>

              <span className="text-xs font-semibold text-slate-300">
                Chapter {currentStep.chapterNumber} of {DEMO_STEPS.length}:{' '}
                <span className="text-white font-bold">{currentStep.title}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Total Time Counter */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700/70 text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {formatTime(currentTotalSeconds)} / {formatTime(TOTAL_DEMO_SECONDS)}
                </span>
              </div>

              {/* Minimize / Maximize */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title={isMinimized ? 'Expand Subtitles & Highlights' : 'Minimize to compact bar'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              {/* Close / Exit Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/20 transition-colors"
                title="Exit Demo Mode"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtitles & Highlights (Expandable) */}
          {!isMinimized && (
            <div className="mb-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
              {/* Live Voiceover Subtitles */}
              <div className="lg:col-span-8 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {isVoiceSpeaking ? (
                    <div className="flex items-end gap-0.5 h-4 w-4">
                      <span className="w-1 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                      <span className="w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                      <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" />
                    </div>
                  ) : (
                    <Volume2 className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Live Narrator Voiceover {isMuted && '(Muted)'}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed italic">
                    "{currentStep.voiceScript}"
                  </p>
                </div>
              </div>

              {/* Architectural Highlights Chips */}
              <div className="lg:col-span-4 flex flex-wrap gap-1.5">
                {currentStep.highlights.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] font-medium text-slate-200"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Controller & Chapter Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/90">
            {/* Chapter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              {DEMO_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => jumpToStep(idx)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    idx === currentStepIndex
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : idx < currentStepIndex
                      ? 'bg-slate-800/80 text-emerald-300 hover:bg-slate-700'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {step.chapterNumber}. {step.tab.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Prev */}
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Previous Chapter"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause */}
              <button
                type="button"
                onClick={togglePlay}
                className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 flex items-center gap-2 transition-all shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span className="text-xs">{isPlaying ? 'Pause' : 'Resume'}</span>
              </button>

              {/* Next */}
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStepIndex === DEMO_STEPS.length - 1}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
                title="Next Chapter"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Mute Voiceover */}
              <button
                type="button"
                onClick={toggleMute}
                className={`p-2 rounded-xl border transition-colors ${
                  isMuted
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute Narrator' : 'Mute Narrator'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Speed Toggle */}
              <button
                type="button"
                onClick={toggleSpeed}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold text-slate-200 transition-colors"
                title="Toggle Speed (1x / 1.25x)"
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
