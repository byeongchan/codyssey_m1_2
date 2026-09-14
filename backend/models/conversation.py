from pydantic import BaseModel
from typing import Optional


class Message(BaseModel):
    role: str
    content: str


class ConversationCreate(BaseModel):
    title: str
    messages: list[Message]


class ConversationResponse(BaseModel):
    id: str
    title: str
    provider: Optional[str] = None
    messages: list[Message]
    created_at: Optional[str] = None