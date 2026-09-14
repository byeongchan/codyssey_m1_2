from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from models.chat import ChatRequest, ChatResponse
from routers.data import get_data_summary
from services.ai_service import ask_ai
from services.firebase_service import db


router = APIRouter(
    prefix="/api/chat",
    tags=["chat"]
)


@router.post("", response_model=ChatResponse)
def chat(request: ChatRequest):
    if request.provider.lower() not in ["openai", "gemini"]:
        raise HTTPException(
            status_code=400,
            detail="provider는 openai 또는 gemini만 사용할 수 있습니다."
        )

    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="질문을 입력해주세요."
        )

    try:
        # 1. 데이터 요약 가져오기
        summary = get_data_summary()

        # 2. AI 답변 생성
        answer = ask_ai(
            provider=request.provider,
            question=request.question,
            summary=summary
        )

        # 3. 대화 자동 저장
        doc_ref = db.collection("conversations").document()

        document = {
            "title": request.question[:50],
            "provider": request.provider.lower(),
            "messages": [
                {
                    "role": "user",
                    "content": request.question
                },
                {
                    "role": "assistant",
                    "content": answer
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        doc_ref.set(document)

        # 4. 결과 반환
        return ChatResponse(
            provider=request.provider,
            question=request.question,
            answer=answer,
            conversation_id=doc_ref.id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI 답변 생성 중 오류가 발생했습니다: {str(e)}"
        )