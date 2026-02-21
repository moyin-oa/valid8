from app.schemas.tts import TtsTextRequest, TtsTextResponse


def build_tts_text(payload: TtsTextRequest) -> TtsTextResponse:
    lines = [payload.summary.strip()]
    if payload.actionItems:
        lines.append("Action items:")
        for idx, item in enumerate(payload.actionItems, start=1):
            lines.append(f"{idx}. {item.text}")
    text = "\n".join(line for line in lines if line)
    return TtsTextResponse(documentId=payload.documentId, text=text)
