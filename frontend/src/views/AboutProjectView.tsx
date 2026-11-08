import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Layers,
  Code2,
  AlertTriangle,
  Lightbulb,
  FileCheck2,
  Sparkles,
  GitCompare,
  Cpu
} from 'lucide-react';

export const AboutProjectView: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Title & Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 card-shadow space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
          P19 Academic Research Project
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          P19 — Encoder–Decoder Translator (English → Hindi / Marathi)
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed font-normal">
          An empirical comparative study evaluating Sequence-to-Sequence Neural Machine Translation 
          versus Large Language Models for Indic language generation, multimodal caption translation, 
          acoustic speech synthesis, and gender-bias mitigation.
        </p>
      </div>

      {/* Problem Statement & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Problem Statement
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Indic languages like Hindi and Marathi exhibit rich morphology, gender-inflected verbal agreement, 
            and complex honorific systems. While traditional Neural Machine Translation (NMT) architectures 
            guarantee syntactic alignment through supervised parallel training, they frequently default to 
            stereotypical gender markers and lack stylistic tone steerability. Conversely, modern generative LLMs 
            excel in instruction-conditioned register adjustment but may introduce hallucinations or higher inference latency.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Core Objectives
          </h3>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-bold text-brand-600">1.</span>
              <span>Deploy verified MarianMT encoder–decoder checkpoints for English → Hindi and English → Marathi.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-brand-600">2.</span>
              <span>Formulate instruction-engineered LLM translation pipelines supporting 4 distinct sociolinguistic registers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-brand-600">3.</span>
              <span>Integrate vision-language BLIP captioning and Indic text-to-speech for end-to-end multimodal workflows.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-brand-600">4.</span>
              <span>Conduct reproducible 20-sentence SacreBLEU evaluation and a 10-case gender-bias audit.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Five Work Units (U1-U5) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="w-5 h-5 text-brand-600" />
          Five Project Work Units (U1–U5)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <span className="font-mono font-bold text-brand-700 uppercase">Unit 1: NMT Engine</span>
            <h4 className="font-bold text-slate-900 text-sm">Seq2Seq Pipeline</h4>
            <p className="text-slate-600 leading-relaxed">
              MarianMT transformer integration (`opus-mt-en-hi` & `opus-mt-en-mr`), device auto-detection, beam search decoding, and latency profiling.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <span className="font-mono font-bold text-purple-700 uppercase">Unit 2: LLM Engine</span>
            <h4 className="font-bold text-slate-900 text-sm">Instruction-Tuned GenAI</h4>
            <p className="text-slate-600 leading-relaxed">
              Provider-agnostic API integration with structured prompt templates directing formality, honorifics, and entity preservation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <span className="font-mono font-bold text-amber-700 uppercase">Unit 3: Multimodal & Voice</span>
            <h4 className="font-bold text-slate-900 text-sm">Vision & Acoustic</h4>
            <p className="text-slate-600 leading-relaxed">
              BLIP vision-to-language captioning followed by cascade translation, paired with native Hindi & Marathi speech synthesis.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <span className="font-mono font-bold text-emerald-700 uppercase">Unit 4: Evaluation Lab</span>
            <h4 className="font-bold text-slate-900 text-sm">SacreBLEU Benchmark</h4>
            <p className="text-slate-600 leading-relaxed">
              Rigorous 20-sentence benchmark suite, editable human references, and standardized SacreBLEU metrics with CSV exports.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5 md:col-span-2 lg:col-span-2">
            <span className="font-mono font-bold text-rose-700 uppercase">Unit 5: Sociolinguistic Audit</span>
            <h4 className="font-bold text-slate-900 text-sm">Gender-Bias & Morphology Analysis</h4>
            <p className="text-slate-600 leading-relaxed">
              Empirical review of 10 profession test cases distinguishing legitimate target grammatical agreement from occupational stereotyping.
            </p>
          </div>
        </div>
      </div>

      {/* Research Comparison: Seq2Seq vs LLM */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <GitCompare className="w-5 h-5 text-brand-600" />
          Research Comparison: Encoder–Decoder vs. LLM Translation
        </h3>

        <div className="text-xs text-slate-600 leading-relaxed space-y-3">
          <p>
            An essential academic insight from this project is the conceptual divergence between 
            <strong> task-specific Sequence-to-Sequence models</strong> and <strong>general-purpose Large Language Models</strong>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-2">
              <h4 className="font-bold text-blue-900 text-sm">MarianMT (Encoder–Decoder)</h4>
              <p>
                Trained explicitly on millions of parallel sentence pairs. The encoder acts as a semantic extractor, 
                and cross-attention in the decoder tightly aligns target tokens to source phrases.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Deterministic, low risk of hallucinations</li>
                <li>Fast inference speed (~150-400ms on CPU/MPS)</li>
                <li>Static register; cannot steer tone dynamically</li>
                <li>Prone to default masculine inflections on neutral professions</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-2">
              <h4 className="font-bold text-purple-900 text-sm">LLMs (Autoregressive Generative)</h4>
              <p>
                Trained on vast web-scale pre-training data and instruction-tuned. Generates translation via contextual language modeling.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Excellent sociolinguistic tone & honorific steerability</li>
                <li>Context-aware pronoun resolution (e.g. singular 'they')</li>
                <li>Requires external API credentials or high GPU RAM</li>
                <li>Variability in BLEU depending on temperature and prompt</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack & Deliverables */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <Code2 className="w-5 h-5 text-brand-600" />
          Technical Stack & Deliverables
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-800 block mb-1">Frontend</span>
            <p className="text-slate-500">React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Framer Motion</p>
          </div>
          <div>
            <span className="font-bold text-slate-800 block mb-1">Backend</span>
            <p className="text-slate-500">FastAPI, Uvicorn, Pydantic v2, Python 3.14 venv</p>
          </div>
          <div>
            <span className="font-bold text-slate-800 block mb-1">AI / ML</span>
            <p className="text-slate-500">Hugging Face Transformers, PyTorch, MarianMT, BLIP, SacreBLEU, gTTS</p>
          </div>
          <div>
            <span className="font-bold text-slate-800 block mb-1">Deliverables</span>
            <p className="text-slate-500">Full source repository, benchmark datasets, CSV export logs, architectural documentation</p>
          </div>
        </div>
      </div>

      {/* Known Limitations */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 card-shadow space-y-3">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Known Limitations
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>
            <strong>Devanagari Subword Tokenization:</strong> MarianMT vocabularies can produce subword splits on low-frequency modern colloquial Marathi slang.
          </li>
          <li>
            <strong>LLM API Dependency:</strong> LLM comparison requires user-provided API credentials configured in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">backend/.env</code>.
          </li>
          <li>
            <strong>Hardware Constraints:</strong> BLIP and MarianMT run on local CPU or Apple MPS, where batch inference for all 20 sentences scales with hardware core count.
          </li>
        </ul>
      </div>
    </div>
  );
};

