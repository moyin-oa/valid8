from fastapi import APIRouter, HTTPException

from app.schemas.tts import TtsTextRequest, TtsTextResponse
from app.services.tts_service import build_tts_text

router = APIRouter(prefix="/tts", tags=["tts"])


@router.post("/text", response_model=TtsTextResponse)
async def tts_text(payload: TtsTextRequest):
    try:
        return build_tts_text(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "code": "TTS_TEXT_BUILD_FAILED",
                "message": str(exc),
                "retryable": False,
            },
        ) from exc
