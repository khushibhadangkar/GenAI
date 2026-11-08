# P19 — LINGUA AI
### Intelligent Translation Across Languages (English → Hindi & English → Marathi)

**Lingua AI** is an academic Natural Language Processing (NLP) research platform developed for **P19**. It investigates, contrasts, and benchmarks Sequence-to-Sequence (Seq2Seq) **Encoder–Decoder Neural Machine Translation (MarianMT)** against autoregressive **Large Language Models (LLMs)** across both Hindi and Marathi. The platform features multimodal **BLIP image caption translation**, language-specific **neural text-to-speech (TTS)**, a **20-sentence SacreBLEU evaluation laboratory**, and a **10-case sociolinguistic gender-bias evaluation protocol**.

---

## 1. Key Capabilities & Features

1. **Dual Translation Architectures**:
   - **MarianMT Encoder–Decoder**: Direct sequence-to-sequence translation fine-tuned on parallel corpora (`Helsinki-NLP/opus-mt-en-hi` and `Helsinki-NLP/opus-mt-en-mr`).
   - **Large Language Model (LLM)**: Prompt-conditioned translation supporting dynamic tone steering (*Neutral*, *Formal*, *Conversational*, *Respectful*).
2. **Side-by-Side Model Comparison**:
   - Simultaneous live dual-inference with millisecond latency measurement.
   - Comprehensive analytical comparison table assessing lexical fidelity, grammatical agreement, fluency, register compliance, and gender handling.
3. **Multimodal Image Translation Studio**:
   - Drag-and-drop image upload (JPEG, PNG, WebP).
   - Automated descriptive English caption generation using **Salesforce BLIP** (`Salesforce/blip-image-captioning-base`).
   - Interactive caption editor before translation into Hindi or Marathi.
4. **Voice Studio (Indic Neural Speech)**:
   - Separate verified voice synthesis for Hindi (`hi`) and Marathi (`mr`) in Devanagari script.
   - Interactive waveform player, speech pace adjustments, and direct MP3 audio export.
5. **20-Sentence SacreBLEU Evaluation Lab**:
   - Fixed academic benchmark dataset across 20 sentences spanning technology, academics, governance, and daily life.
   - Editable human reference translations.
   - Automated generation of predictions for MarianMT and LLMs.
   - Real-time SacreBLEU corpus score calculation with separate Hindi and Marathi metrics and CSV data export.
6. **Gender-Bias & Morphology Analysis**:
   - 10 predefined occupational test sentences (e.g. *The engineer arrived early*, *The doctor explained the treatment*, *The man is a nurse*).
   - Investigation into default gender assumptions vs. obligatory grammatical agreement.
   - Six structured classification categories with reviewer observation logging and distribution charts.
7. **Academic Project Dossier**:
   - Full documentation of P19 problem formulation, objectives, U1–U5 work units, system architecture, and known limitations.

---

## 2. System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │                   LINGUA AI (P19)                      │
                    │               React + Vite + Tailwind                  │
                    └──────────┬─────────────────────────────────┬───────────┘
                               │                                 │
                     HTTP / REST API (FastAPI)           Multimodal Uploads
                               │                                 │
            ┌──────────────────┴─────────────────────────────────┴──────────────────┐
            │                             FastAPI Backend                           │
            │                         (Python 3.14 / PyTorch)                       │
            └──────┬──────────────┬──────────────┬──────────────┬─────────────┬─────┘
                   │              │              │              │             │
            ┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼─────┐┌──────▼─────┐
            │  MarianMT   ││     LLM     ││    BLIP     ││  SacreBLEU ││    gTTS    │
            │  (Seq2Seq)  ││ (Prompt MT) ││  (Vision)   ││ (Benchmark)││   (Audio)  │
            │ EN→HI/EN→MR ││ Configurable││  Captions   ││  Scoring   ││   HI / MR  │
            └─────────────┘└─────────────┘└─────────────┘└─────────────┘└───────────┘
```

---

## 3. Technology Stack

- **Frontend**:
  - React 18, TypeScript, Vite
  - Tailwind CSS (Linear / Notion inspired minimalist palette)
  - Lucide React (Clean feather iconography)
  - Recharts (Interactive evaluation bar charts & bias distribution charts)
- **Backend**:
  - FastAPI (High performance ASGI web framework)
  - Pydantic v2 (Request/response data validation and schema integrity)
  - Uvicorn (Production ASGI server)
- **Machine Learning & NLP**:
  - PyTorch (MPS on Apple Silicon, CUDA on GPU, or CPU fallback)
  - Hugging Face Transformers (`AutoModelForSeq2SeqLM`, `AutoTokenizer`, `BlipForConditionalGeneration`)
  - SacreBLEU (Standardized academic BLEU scoring)
  - gTTS (Google Text-to-Speech with verified Devanagari Hindi and Marathi voices)

---

## 4. Model Checkpoints

| Component | Model Checkpoint | Architecture | Purpose |
| :--- | :--- | :--- | :--- |
| **English → Hindi NMT** | `Helsinki-NLP/opus-mt-en-hi` | MarianMT (Encoder–Decoder) | Supervised sequence-to-sequence Hindi translation |
| **English → Marathi NMT** | `Helsinki-NLP/opus-mt-en-mr` | MarianMT (Encoder–Decoder) | Supervised sequence-to-sequence Marathi translation |
| **Multimodal Vision** | `Salesforce/blip-image-captioning-base` | Vision Transformer + Language Decoder | Automated visual scene description in English |
| **Generative Translation** | Configurable (`gpt-4o-mini`, Groq, Ollama, etc.) | Autoregressive Decoder | Tone-conditioned translation and register steering |
| **Speech Synthesis** | Google TTS Engine (`hi`, `mr`) | Acoustic Concatenative / Neural | Native Devanagari audio pronunciation |

---

## 5. Prerequisites & Quickstart

### Prerequisites
- Node.js (v18+) and npm
- Python (v3.10+)

### Step 1: Clone and Inspect
```bash
git clone <repository-url>
cd GenAI
```

### Step 2: Configure Environment Variables
Copy `.env.example` into `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
To enable live LLM translations in addition to MarianMT, add your API key in `backend/.env`:
```env
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4o-mini
# LLM_BASE_URL=https://api.groq.com/openai/v1  # (optional for alternative providers)
```
*(If no API key is set, MarianMT operates locally with full functionality, and the LLM module indicates awaiting credentials without fabricating outputs.)*

### Step 3: Run the Backend
```bash
# Activate virtual environment
source backend/venv/bin/activate

# Run FastAPI with uvicorn
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

### Step 4: Run the Frontend
In a separate terminal:
```bash
cd frontend
npm run dev
```
The application will be accessible at: `http://localhost:5173`

---

## 6. Running Tests & Reproducible Evaluation

Run the automated test suite with pytest:
```bash
backend/venv/bin/pytest tests/test_backend.py -v
```
All 9 automated unit and integration tests verify:
- API health and model configuration status endpoints.
- Empty text and malformed payload validations.
- SacreBLEU calculation accuracy with standard test fixtures.
- Devanagari TTS synthesis and audio stream endpoints.
- Multimodal image upload validation.
- Evaluation 20-sentence dataset integrity.
- Bias cases retrieval, observation update, and persistence.
- Graceful error responses when external LLM credentials are not configured.

---

## 7. Experimental Workflows

### Running the 20-Sentence SacreBLEU Benchmark
1. Navigate to **Evaluation Lab** from the sidebar.
2. Review the 20 test sentences and human reference translations.
3. Click **Execute Full Benchmark & SacreBLEU**.
4. The system translates all 20 sentences through MarianMT and LLMs, calculates corpus BLEU scores using SacreBLEU, and renders side-by-side comparative charts.
5. Click **Export CSV** to download `lingua_ai_evaluation_results.csv`.

### Conducting Gender-Bias & Morphology Audits
1. Navigate to **Bias Analysis**.
2. Select any of the 10 profession test cases.
3. Compare the MarianMT and LLM translations in Hindi and Marathi against the linguistic notes.
4. Categorize the observed translation into one of the 6 formal categories:
   - *Gender explicitly present in source*
   - *Gender required by target-language grammar*
   - *Unsupported gender inference*
   - *Occupational stereotype*
   - *Incorrect gender agreement*
   - *Ambiguous result*
5. Add reviewer notes and click **Record Observation**.
6. The empirical category distribution chart updates in real-time.
7. Click **Export CSV** to download `lingua_ai_gender_bias_analysis.csv`.

---

## 8. Academic Project Work Units (P19)

- **Unit 1 (U1)**: Integration of MarianMT Seq2Seq models for English → Hindi and English → Marathi.
- **Unit 2 (U2)**: Prompt-engineered LLM integration for register and tone steering (Formal, Conversational, Respectful).
- **Unit 3 (U3)**: Multimodal BLIP image captioning cascade translation and Indic neural text-to-speech.
- **Unit 4 (U4)**: Reproducible 20-sentence benchmark suite and automated SacreBLEU scoring.
- **Unit 5 (U5)**: Sociolinguistic gender-bias assessment on profession translations with empirical reviewer logging.

---

## 9. License & Academic Attribution
Developed as part of the **P19 Encoder–Decoder Translator** academic NLP research curriculum.

