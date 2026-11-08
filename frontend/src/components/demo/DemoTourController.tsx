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
    title: 'Overview Dashboard',
    subtitle: 'Active models and system status',
    duration: 20,
    voiceScript:
      'Welcome to the live demo of Lingua AI. On this dashboard, you can see our active models for Hindi and Marathi translation, system health, and hardware acceleration.',
    highlights: [
      'Active Hindi & Marathi Models',
      'Hardware Accelerated',
      'Sub-second Latency',
      'System Ready'
    ]
  },
  {
    id: 'translator',
    tab: 'translator',
    chapterNumber: 2,
    title: 'Interactive Translator',
    subtitle: 'English to Hindi & Marathi translation with tone selection',
    duration: 25,
    voiceScript:
      'Here is the Translator. Watch as we enter an English sentence and translate it directly into Hindi. Notice how fast it translates, and you can listen to the audio with one click.',
    highlights: [
      'English to Hindi & Marathi',
      'Tone Selection',
      'Fast Translation',
      'Audio Playback'
    ]
  },
  {
    id: 'image-translator',
    tab: 'image-translator',
    chapterNumber: 3,
    title: 'Image Translation Studio',
    subtitle: 'Extracting captions from images and translating them',
    duration: 25,
    voiceScript:
      'In the Image Studio, we select a photo. The system identifies what is in the picture, writes an English caption, and immediately translates it into Hindi.',
    highlights: [
      'Image Captioning',
      'Instant Translation',
      'Visual Input',
      'Audio Readout'
    ]
  },
  {
    id: 'model-comparison',
    tab: 'model-comparison',
    chapterNumber: 4,
    title: 'Model Comparison',
    subtitle: 'Side-by-side comparison of MarianMT and LLM',
    duration: 25,
    voiceScript:
      'Here we compare two different models side by side. You can see their translation outputs, response times, and quality differences on the exact same sentence.',
    highlights: [
      'Side-by-Side Outputs',
      'Speed Benchmarks',
      'Translation Quality',
      'Evaluator Notes'
    ]
  },
  {
    id: 'voice-studio',
    tab: 'voice-studio',
    chapterNumber: 5,
    title: 'Voice Studio',
    subtitle: 'Text-to-speech voice generation for Hindi and Marathi',
    duration: 20,
    voiceScript:
      'The Voice Studio turns translated text into natural spoken audio. You can select Hindi or Marathi, generate the speech, and listen to the clear pronunciation.',
    highlights: [
      'Spoken Audio',
      'Hindi & Marathi Voices',
      'Waveform Visualizer',
      'Download MP3'
    ]
  },
  {
    id: 'bias-analysis',
    tab: 'bias-analysis',
    chapterNumber: 6,
    title: 'Bias Analysis',
    subtitle: 'Checking fairness in professional translations',
    duration: 20,
    voiceScript:
      'In this section, we test for gender bias. We check whether jobs like doctor, nurse, or engineer are translated fairly without stereotyping.',
    highlights: [
      'Profession Testing',
      'Fairness Check',
      'Pronoun Analysis',
      'Detailed Test Cases'
    ]
  },
  {
    id: 'evaluation-lab',
    tab: 'evaluation-lab',
    chapterNumber: 7,
    title: 'Evaluation Lab',
    subtitle: 'Testing translation accuracy with BLEU scores',
    duration: 15,
    voiceScript:
      'Finally, the Evaluation Lab tests translation accuracy across test sentences using standard BLEU scores. This confirms reliable, high-quality translations.',
    highlights: [
      'BLEU Accuracy Score',
      'Test Dataset',
      'Quality Benchmarks',
      'Verified Results'
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
                Live Demo
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
              <div className="lg:col-span-8 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Live Caption
                    </span>
                    {isMuted && (
                      <span className="text-[10px] text-red-400 font-medium">(Muted)</span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-white font-semibold leading-relaxed">
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

