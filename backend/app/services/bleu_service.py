import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional
import sacrebleu
from app.config import settings
from app.models.schemas import BleuScoreItem

logger = logging.getLogger(__name__)

class BLEUService:
    def __init__(self):
        self.data_dir: Path = settings.DATA_DIR
        self.results_file: Path = self.data_dir / "evaluation_results.json"

    def compute_bleu(
        self,
        hypotheses: List[str],
        references: List[str],
        model_name: str,
        target_lang: str,
        tokenizer: str = "intl"
    ) -> BleuScoreItem:
        """
        Computes standard SacreBLEU corpus score across valid hypothesis-reference pairs.
        """
        if not hypotheses or not references:
            raise ValueError("Hypotheses and references lists cannot be empty.")
        if len(hypotheses) != len(references):
            raise ValueError(f"Mismatch in count: {len(hypotheses)} hypotheses vs {len(references)} references.")
        
        # Filter pairs where both hypothesis and reference are non-empty
        valid_hyps = []
        valid_refs = []
        for h, r in zip(hypotheses, references):
            if h and h.strip() and r and r.strip():
                valid_hyps.append(h.strip())
                valid_refs.append(r.strip())
                
        if not valid_hyps:
            raise ValueError("No non-empty hypothesis-reference pairs available to evaluate.")

        try:
            # Attempt flores101 or intl tokenization suited for Indic Devanagari script
            bleu = sacrebleu.corpus_bleu(
                valid_hyps,
                [valid_refs],
                tokenize=tokenizer
            )
        except Exception as e:
            logger.warning(f"Tokenizer '{tokenizer}' failed ({e}), falling back to 'intl'")
            bleu = sacrebleu.corpus_bleu(
                valid_hyps,
                [valid_refs],
                tokenize="intl"
            )

        timestamp = datetime.now(timezone.utc).isoformat()
        
        return BleuScoreItem(
            model=model_name,
            language=target_lang,
            score=round(float(bleu.score), 2),
            signature=str(bleu.format()),
            sentence_count=len(valid_hyps),
            timestamp=timestamp
        )

    def load_persisted_results(self) -> Optional[Dict[str, Any]]:
        if self.results_file.exists():
            try:
                with open(self.results_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to read evaluation_results.json: {e}")
        return None

    def save_results(self, data: Dict[str, Any]) -> None:
        try:
            with open(self.results_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info("Persisted evaluation results to evaluation_results.json")
        except Exception as e:
            logger.error(f"Failed to write evaluation_results.json: {e}")

bleu_service = BLEUService()

