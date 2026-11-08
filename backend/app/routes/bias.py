import csv
import io
import json
import logging
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.config import settings
from app.models.schemas import (
    BiasCaseItem,
    BiasObservationUpdate,
    BiasResultsResponse
)
from app.services.nmt_service import nmt_service
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/bias", tags=["Gender Bias Analysis"])

VALID_CATEGORIES = [
    "Gender explicitly present in source",
    "Gender required by target-language grammar",
    "Unsupported gender inference",
    "Occupational stereotype",
    "Incorrect gender agreement",
    "Ambiguous result"
]

def _get_bias_file() -> Path:
    return settings.DATA_DIR / "bias_results.json"

def _load_bias_cases() -> List[Dict[str, Any]]:
    results_path = _get_bias_file()
    if results_path.exists():
        try:
            with open(results_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading bias_results.json: {e}")

    # Fallback to initial cases
    cases_path = settings.DATA_DIR / "bias_cases.json"
    with open(cases_path, "r", encoding="utf-8") as f:
        return json.load(f)

def _save_bias_cases(data: List[Dict[str, Any]]):
    results_path = _get_bias_file()
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@router.get("/cases", response_model=List[BiasCaseItem])
def get_bias_cases():
    cases = _load_bias_cases()
    return [BiasCaseItem(**c) for c in cases]

@router.post("/run", response_model=List[BiasCaseItem])
async def run_bias_translations():
    """
    Translates all 10 bias benchmark sentences with MarianMT (and LLM if configured)
    into Hindi and Marathi.
    """
    cases = _load_bias_cases()
    
    for case in cases:
        source = case["source"]
        
        # 1. MarianMT translation
        try:
            trans_hi, _, _ = nmt_service.translate(source, "hi")
            case["nmt_hi"] = trans_hi
        except Exception as e:
            logger.error(f"NMT-Hi bias run failed for '{source}': {e}")
            
        try:
            trans_mr, _, _ = nmt_service.translate(source, "mr")
            case["nmt_mr"] = trans_mr
        except Exception as e:
            logger.error(f"NMT-Mr bias run failed for '{source}': {e}")

        # 2. LLM translation if configured
        if llm_service.is_configured():
            try:
                llm_hi, _, _ = await llm_service.translate(source, "hi", "neutral")
                case["llm_hi"] = llm_hi
            except Exception as e:
                logger.error(f"LLM-Hi bias run failed for '{source}': {e}")
                
            try:
                llm_mr, _, _ = await llm_service.translate(source, "mr", "neutral")
                case["llm_mr"] = llm_mr
            except Exception as e:
                logger.error(f"LLM-Mr bias run failed for '{source}': {e}")

    _save_bias_cases(cases)
    return [BiasCaseItem(**c) for c in cases]

@router.post("/update", response_model=BiasCaseItem)
def update_bias_observation(update: BiasObservationUpdate):
    if update.category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{update.category}'. Must be one of: {VALID_CATEGORIES}"
        )
    
    cases = _load_bias_cases()
    matched = None
    for case in cases:
        if case["id"] == update.id:
            case["category"] = update.category
            case["reviewer_notes"] = update.reviewer_notes.strip()
            case["reviewed"] = True
            matched = case
            break

    if not matched:
        raise HTTPException(status_code=404, detail=f"Bias case with id {update.id} not found.")

    _save_bias_cases(cases)
    return BiasCaseItem(**matched)

@router.get("/results", response_model=BiasResultsResponse)
def get_bias_results():
    cases = _load_bias_cases()
    distribution: Dict[str, int] = {cat: 0 for cat in VALID_CATEGORIES}
    reviewed_count = 0

    for case in cases:
        cat = case.get("category")
        if cat and cat in distribution:
            distribution[cat] += 1
        if case.get("reviewed"):
            reviewed_count += 1

    return BiasResultsResponse(
        cases=[BiasCaseItem(**c) for c in cases],
        category_distribution=distribution,
        reviewed_count=reviewed_count,
        total_count=len(cases)
    )

@router.get("/export")
def export_bias_csv():
    cases = _load_bias_cases()
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Case ID", "Source Sentence", "Profession", "Explicit Gender",
        "MarianMT Hindi", "LLM Hindi", "MarianMT Marathi", "LLM Marathi",
        "Linguistic Note", "Reviewed Category", "Reviewer Notes", "Status"
    ])
    
    for c in cases:
        writer.writerow([
            c.get("id"),
            c.get("source"),
            c.get("profession", ""),
            "Yes" if c.get("explicit_gender") else "No",
            c.get("nmt_hi", ""),
            c.get("llm_hi", ""),
            c.get("nmt_mr", ""),
            c.get("llm_mr", ""),
            c.get("grammatical_note", ""),
            c.get("category", "Unreviewed"),
            c.get("reviewer_notes", ""),
            "Reviewed" if c.get("reviewed") else "Pending"
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=lingua_ai_gender_bias_analysis.csv"}
    )

