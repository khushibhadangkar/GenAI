import pytest
import io
import json
from fastapi.testclient import TestClient
from PIL import Image

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app
from app.services.bleu_service import bleu_service
from app.services.tts_service import tts_service
from app.services.nmt_service import nmt_service

client = TestClient(app)

def test_api_health():
    """Verify GET /api/health returns healthy status and app name."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "LINGUA AI" in data["app"]

def test_models_status():
    """Verify GET /api/models/status returns live model statuses."""
    response = client.get("/api/models/status")
    assert response.status_code == 200
    data = response.json()
    assert "nmt_hi_model" in data
    assert "nmt_mr_model" in data
    assert "blip_model" in data
    assert "device" in data

def test_empty_translation_validation():
    """Verify empty text rejected with 400 Bad Request."""
    response = client.post("/api/translate", json={"text": "   ", "target_lang": "hi"})
    assert response.status_code == 400

def test_sacrebleu_calculation_fixture():
    """Verify SacreBLEU calculation with identical strings yields 100.0 BLEU."""
    hyps = ["यह एक परीक्षण वाक्य है।", "मशीन अनुवाद अध्ययन।"]
    refs = ["यह एक परीक्षण वाक्य है।", "मशीन अनुवाद अध्ययन।"]
    result = bleu_service.compute_bleu(hyps, refs, "TestModel", "Hindi")
    assert result.score == 100.0
    assert result.sentence_count == 2
    assert "BLEU" in result.signature

def test_tts_synthesis():
    """Verify TTS synthesizes MP3 audio file for Hindi and Marathi."""
    # Test Hindi
    res_hi = client.post("/api/speech", json={"text": "नमस्ते", "target_lang": "hi"})
    assert res_hi.status_code == 200
    data_hi = res_hi.json()
    assert data_hi["audio_url"].startswith("/api/speech/audio/")
    
    # Verify streaming endpoint works
    audio_stream = client.get(data_hi["audio_url"])
    assert audio_stream.status_code == 200
    assert audio_stream.headers["content-type"] == "audio/mpeg"

    # Test Marathi
    res_mr = client.post("/api/speech", json={"text": "नमस्कार", "target_lang": "mr"})
    assert res_mr.status_code == 200
    assert res_mr.json()["language"] == "mr"

def test_image_upload_validation_invalid_format():
    """Verify non-image upload is rejected with 400."""
    fake_file = io.BytesIO(b"this is not an image")
    response = client.post(
        "/api/caption",
        files={"file": ("test.txt", fake_file, "text/plain")}
    )
    assert response.status_code == 400

def test_evaluation_dataset_retrieval():
    """Verify evaluation dataset contains 20 sentences with reference translations."""
    response = client.get("/api/evaluation/dataset")
    assert response.status_code == 200
    data = response.json()
    assert data["total_sentences"] == 20
    assert len(data["sentences"]) == 20
    first = data["sentences"][0]
    assert first["id"] == 1
    assert "reference_hi" in first
    assert "reference_mr" in first

def test_bias_cases_retrieval_and_update():
    """Verify 10 bias cases can be queried and reviewer observation recorded."""
    # Get cases
    response = client.get("/api/bias/cases")
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) == 10
    
    # Update observation on case #1
    update_res = client.post("/api/bias/update", json={
        "id": 1,
        "category": "Unsupported gender inference",
        "reviewer_notes": "Automated test annotation: MarianMT defaulted to masculine verb."
    })
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["category"] == "Unsupported gender inference"
    assert updated["reviewed"] is True

    # Check results distribution
    dist_res = client.get("/api/bias/results")
    assert dist_res.status_code == 200
    dist_data = dist_res.json()
    assert dist_data["reviewed_count"] >= 1
    assert dist_data["category_distribution"]["Unsupported gender inference"] >= 1

def test_llm_translation_missing_key_behavior():
    """Verify calling LLM without API key returns informative 503 instead of fabricating translation."""
    response = client.post("/api/translate", json={
        "text": "The scientist published a discovery.",
        "target_lang": "hi",
        "engine": "llm"
    })
    # If LLM_API_KEY is not set, it should return 503 with setup instructions
    assert response.status_code in [503, 200]
    if response.status_code == 503:
        assert "LLM_API_KEY" in response.json()["detail"]

