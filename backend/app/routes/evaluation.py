import csv
import io
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.config import settings
from app.models.schemas import (
    EvaluationDatasetResponse,
    EvaluationSentence,
    UpdateReferencesRequest,
    EvaluationRunRequest,
    EvaluationResultsResponse,
    BleuScoreItem
)
from app.services.nmt_service import nmt_service
from app.services.llm_service import llm_service
from app.services.bleu_service import bleu_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/evaluation", tags=["Evaluation Lab"])

def _load_data_files() -> tuple[list, dict, dict]:
    sentences_path = settings.DATA_DIR / "test_sentences.json"
    ref_hi_path = settings.DATA_DIR / "references_hi.json"
    ref_mr_path = settings.DATA_DIR / "references_mr.json"
    
    with open(sentences_path, "r", encoding="utf-8") as f:
        sentences = json.load(f)
    with open(ref_hi_path, "r", encoding="utf-8") as f:
        ref_hi = json.load(f)
    with open(ref_mr_path, "r", encoding="utf-8") as f:
        ref_mr = json.load(f)
        
    return sentences, ref_hi, ref_mr

@router.get("/dataset", response_model=EvaluationDatasetResponse)
def get_dataset():
    sentences, ref_hi, ref_mr = _load_data_files()
    persisted = bleu_service.load_persisted_results()
    pred_map = {}
    if persisted and "sentences" in persisted:
        for s in persisted["sentences"]:
            pred_map[s["id"]] = s

    combined: List[EvaluationSentence] = []
    for item in sentences:
        s_id = item["id"]
        saved = pred_map.get(s_id, {})
        combined.append(EvaluationSentence(
            id=s_id,
            source=item["source"],
            domain=item.get("domain", "General"),
            reference_hi=ref_hi.get(str(s_id), ""),
            reference_mr=ref_mr.get(str(s_id), ""),
            pred_nmt_hi=saved.get("pred_nmt_hi"),
            pred_llm_hi=saved.get("pred_llm_hi"),
            pred_nmt_mr=saved.get("pred_nmt_mr"),
            pred_llm_mr=saved.get("pred_llm_mr")
        ))

    return EvaluationDatasetResponse(
        total_sentences=len(combined),
        sentences=combined
    )

@router.post("/references")
def update_reference(req: UpdateReferencesRequest):
    ref_hi_path = settings.DATA_DIR / "references_hi.json"
    ref_mr_path = settings.DATA_DIR / "references_mr.json"
    
    with open(ref_hi_path, "r+", encoding="utf-8") as f:
        data = json.load(f)
        if req.reference_hi is not None:
            data[str(req.id)] = req.reference_hi.strip()
            f.seek(0)
            f.truncate()
            json.dump(data, f, ensure_ascii=False, indent=2)

    with open(ref_mr_path, "r+", encoding="utf-8") as f:
        data = json.load(f)
        if req.reference_mr is not None:
            data[str(req.id)] = req.reference_mr.strip()
            f.seek(0)
            f.truncate()
            json.dump(data, f, ensure_ascii=False, indent=2)

    return {"status": "success", "id": req.id}

@router.post("/run", response_model=EvaluationResultsResponse)
async def run_evaluation(req: EvaluationRunRequest):
    sentences, ref_hi, ref_mr = _load_data_files()
    persisted = bleu_service.load_persisted_results() or {}
    existing_sentences = {s["id"]: s for s in persisted.get("sentences", [])}

    updated_items = []
    
    # Run predictions
    for item in sentences:
        s_id = item["id"]
        source = item["source"]
        
        row = existing_sentences.get(s_id, {
            "id": s_id,
            "source": source,
            "domain": item.get("domain", "General"),
            "reference_hi": ref_hi.get(str(s_id), ""),
            "reference_mr": ref_mr.get(str(s_id), ""),
            "pred_nmt_hi": None,
            "pred_llm_hi": None,
            "pred_nmt_mr": None,
            "pred_llm_mr": None,
        })
        row["reference_hi"] = ref_hi.get(str(s_id), "")
        row["reference_mr"] = ref_mr.get(str(s_id), "")

        # 1. NMT Predictions
        if "nmt" in req.engines:
            if "hi" in req.languages:
                try:
                    trans, _, _ = nmt_service.translate(source, "hi")
                    row["pred_nmt_hi"] = trans
                except Exception as e:
                    logger.error(f"NMT-Hi eval error on id {s_id}: {e}")
            if "mr" in req.languages:
                try:
                    trans, _, _ = nmt_service.translate(source, "mr")
                    row["pred_nmt_mr"] = trans
                except Exception as e:
                    logger.error(f"NMT-Mr eval error on id {s_id}: {e}")

        # 2. LLM Predictions (if configured)
        if "llm" in req.engines and llm_service.is_configured():
            if "hi" in req.languages:
                try:
                    trans, _, _ = await llm_service.translate(source, "hi", "neutral")
                    row["pred_llm_hi"] = trans
                except Exception as e:
                    logger.error(f"LLM-Hi eval error on id {s_id}: {e}")
            if "mr" in req.languages:
                try:
                    trans, _, _ = await llm_service.translate(source, "mr", "neutral")
                    row["pred_llm_mr"] = trans
                except Exception as e:
                    logger.error(f"LLM-Mr eval error on id {s_id}: {e}")

        updated_items.append(row)

    # Calculate separate BLEU scores
    scores: List[BleuScoreItem] = []

    # Helper to calculate for a given key pair
    def eval_pair(pred_key: str, ref_key: str, model_label: str, lang: str):
        hyps = [row[pred_key] for row in updated_items if row.get(pred_key)]
        refs = [row[ref_key] for row in updated_items if row.get(pred_key)]
        if hyps and refs and len(hyps) == len(refs):
            try:
                score_item = bleu_service.compute_bleu(hyps, refs, model_label, lang)
                scores.append(score_item)
            except Exception as e:
                logger.warning(f"Failed to calculate BLEU for {model_label} ({lang}): {e}")

    # NMT -> Hindi
    eval_pair("pred_nmt_hi", "reference_hi", f"MarianMT ({settings.NMT_MODEL_HI})", "Hindi")
    # LLM -> Hindi
    eval_pair("pred_llm_hi", "reference_hi", f"LLM ({settings.LLM_MODEL})", "Hindi")
    # NMT -> Marathi
    eval_pair("pred_nmt_mr", "reference_mr", f"MarianMT ({settings.NMT_MODEL_MR})", "Marathi")
    # LLM -> Marathi
    eval_pair("pred_llm_mr", "reference_mr", f"LLM ({settings.LLM_MODEL})", "Marathi")

    timestamp = datetime.now(timezone.utc).isoformat()
    result_data = {
        "timestamp": timestamp,
        "total_sentences": len(updated_items),
        "scores": [s.dict() for s in scores],
        "sentences": updated_items
    }
    bleu_service.save_results(result_data)

    return EvaluationResultsResponse(
        timestamp=timestamp,
        total_sentences=len(updated_items),
        scores=scores,
        sentences=[EvaluationSentence(**item) for item in updated_items]
    )

@router.get("/results", response_model=EvaluationResultsResponse)
def get_results():
    persisted = bleu_service.load_persisted_results()
    if not persisted:
        return EvaluationResultsResponse(
            timestamp=None,
            total_sentences=0,
            scores=[],
            sentences=[]
        )
    return EvaluationResultsResponse(
        timestamp=persisted.get("timestamp"),
        total_sentences=persisted.get("total_sentences", 0),
        scores=[BleuScoreItem(**s) for s in persisted.get("scores", [])],
        sentences=[EvaluationSentence(**s) for s in persisted.get("sentences", [])]
    )

@router.get("/export")
def export_csv():
    persisted = bleu_service.load_persisted_results()
    if not persisted or "sentences" not in persisted:
        raise HTTPException(status_code=404, detail="No evaluation results found to export.")

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Sentence ID", "Source (English)", "Domain",
        "Reference Hindi", "MarianMT Hindi", "LLM Hindi",
        "Reference Marathi", "MarianMT Marathi", "LLM Marathi"
    ])
    
    for s in persisted["sentences"]:
        writer.writerow([
            s.get("id"),
            s.get("source"),
            s.get("domain", ""),
            s.get("reference_hi", ""),
            s.get("pred_nmt_hi", ""),
            s.get("pred_llm_hi", ""),
            s.get("reference_mr", ""),
            s.get("pred_nmt_mr", ""),
            s.get("pred_llm_mr", "")
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=lingua_ai_evaluation_results.csv"}
    )

