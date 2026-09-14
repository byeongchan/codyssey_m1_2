from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from models.conversation import (
    ConversationCreate,
    ConversationResponse,
)
from services.firebase_service import db


router = APIRouter(
    prefix="/api/conversations",
    tags=["conversations"]
)


@router.post("", response_model=ConversationResponse)
def create_conversation(conversation: ConversationCreate):
    doc_ref = db.collection("conversations").document()

    document = {
        "title": conversation.title,
        "messages": [
            message.model_dump()
            for message in conversation.messages
        ],
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    doc_ref.set(document)

    return ConversationResponse(
        id=doc_ref.id,
        **document
    )


@router.get("", response_model=list[ConversationResponse])
def get_conversations():
    documents = (
        db.collection("conversations")
        .order_by("created_at", direction="DESCENDING")
        .stream()
    )

    result = []

    for doc in documents:
        data = doc.to_dict()

        result.append(
            ConversationResponse(
                id=doc.id,
                title=data.get("title", ""),
                provider=data.get("provider"),
                messages=data.get("messages", []),
                created_at=data.get("created_at")
            )
        )

    return result


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str):
    doc_ref = db.collection("conversations").document(conversation_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=404,
            detail="대화를 찾을 수 없습니다."
        )

    data = doc.to_dict()

    return ConversationResponse(
        id=doc.id,
        title=data.get("title", ""),
        provider=data.get("provider"),
        messages=data.get("messages", []),
        created_at=data.get("created_at")
    )


@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: str):
    doc_ref = db.collection("conversations").document(conversation_id)

    if not doc_ref.get().exists:
        raise HTTPException(
            status_code=404,
            detail="대화를 찾을 수 없습니다."
        )

    doc_ref.delete()

    return {
        "message": "대화가 삭제되었습니다.",
        "id": conversation_id
    }