from pydantic import BaseModel


class ChatRequest(BaseModel):
    provider: str
    question: str


class ChatResponse(BaseModel):
    provider: str
    question: str
    answer: str
    conversation_id: str | None = None