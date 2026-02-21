from fastapi import APIRouter, HTTPException

from app.schemas.pdf import PdfExportRequest, PdfExportResponse
from app.services.pdf_service import export_pdf

router = APIRouter(prefix="/pdf", tags=["pdf"])


@router.post("/export", response_model=PdfExportResponse)
async def pdf_export(payload: PdfExportRequest):
    try:
        return export_pdf(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "code": "PDF_EXPORT_FAILED",
                "message": str(exc),
                "retryable": True,
            },
        ) from exc
