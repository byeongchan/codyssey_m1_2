from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    provider: Literal["openai", "gemini"]

    question: str = Field(
        ...,
        min_length=1,
        max_length=2000
    )

    @field_validator("provider", mode="before")
    @classmethod
    def validate_provider(cls, value):
        if not isinstance(value, str):
            raise ValueError(
                "provider는 문자열이어야 합니다."
            )

        value = value.strip().lower()

        if value not in ["openai", "gemini"]:
            raise ValueError(
                "provider는 openai 또는 gemini만 사용할 수 있습니다."
            )

        return value

    @field_validator("question")
    @classmethod
    def validate_question(cls, value):
        value = value.strip()

        if not value:
            raise ValueError(
                "질문을 입력해주세요."
            )

        # 제어문자 제거
        value = "".join(
            char
            for char in value
            if char.isprintable() or char in "\n\t"
        )

        # 위험한 HTML 및 JavaScript 패턴 차단
        dangerous_patterns = [
            "<script",
            "</script>",
            "<iframe",
            "</iframe>",
            "javascript:",
            "onerror=",
            "onclick=",
            "onload="
        ]

        lowered_value = value.lower()

        if any(
            pattern in lowered_value
            for pattern in dangerous_patterns
        ):
            raise ValueError(
                "허용되지 않는 입력이 포함되어 있습니다."
            )

        return value


class ChatResponse(BaseModel):
    provider: str
    question: str
    answer: str
    conversation_id: str | None = None