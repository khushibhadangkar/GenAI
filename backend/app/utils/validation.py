from fastapi import HTTPException, UploadFile
import io
from PIL import Image

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_IMAGE_SIZE_MB = 10
MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

def validate_text_input(text: str, max_chars: int = 5000) -> str:
    cleaned = text.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Input text cannot be empty or whitespace.")
    if len(cleaned) > max_chars:
        raise HTTPException(
            status_code=400, 
            detail=f"Input text exceeds maximum length of {max_chars} characters."
        )
    return cleaned

async def validate_image_upload(file: UploadFile) -> Image.Image:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type '{file.content_type}'. Supported formats: JPG, JPEG, PNG, WebP."
        )
    
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Image size exceeds limit of {MAX_IMAGE_SIZE_MB}MB."
        )
    
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        return image
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid or corrupted image file: {str(e)}"
        )

