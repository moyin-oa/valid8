from pydantic import BaseModel, Field

from app.schemas.pipeline import ActionItem


class TtsTextRequest(BaseModel):
    documentId: str
    summary: str
    actionItems: list[ActionItem] = Field(default_factory=list)


class TtsTextResponse(BaseModel):
    documentId: str
    text: str
