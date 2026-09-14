import os

from dotenv import load_dotenv
from openai import OpenAI
from google import genai

load_dotenv()


def build_prompt(question: str, summary: dict) -> str:
    return f"""
당신은 시계열 데이터를 분석하는 AI 데이터 분석 도우미입니다.

다음은 현재 저장된 데이터의 요약입니다.

[데이터 요약]
- 분석 기간: {summary["period"]["start"]} ~ {summary["period"]["end"]}
- 데이터 개수: {summary["count"]}
- 평균값: {summary["statistics"]["average"]}
- 최솟값: {summary["statistics"]["minimum"]}
- 최댓값: {summary["statistics"]["maximum"]}
- 최근 추세: {summary["recent_trend"]}

사용자의 질문:
{question}

위 데이터를 근거로 사용자의 질문에 답변하세요.

답변 시 다음 원칙을 지켜주세요.
1. 제공된 데이터 범위 안에서 답변하세요.
2. 데이터에 없는 사실을 임의로 만들어내지 마세요.
3. 가능하면 수치를 근거로 설명하세요.
4. 투자 판단이나 매수·매도 권유가 아닌 데이터 분석 관점에서 답변하세요.
5. 이해하기 쉬운 한국어로 답변하세요.
"""


def ask_openai(question: str, summary: dict) -> str:
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY 환경변수가 설정되지 않았습니다."
        )

    client = OpenAI(api_key=api_key)

    prompt = build_prompt(question, summary)

    response = client.responses.create(
        model="gpt-4o-mini",
        input=prompt
    )

    return response.output_text


def ask_gemini(question: str, summary: dict) -> str:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY 환경변수가 설정되지 않았습니다."
        )

    client = genai.Client(api_key=api_key)

    prompt = build_prompt(question, summary)

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )

    return response.text


def ask_ai(
    provider: str,
    question: str,
    summary: dict
) -> str:

    provider = provider.lower()

    if provider == "openai":
        return ask_openai(question, summary)

    if provider == "gemini":
        return ask_gemini(question, summary)

    raise ValueError(
        "지원하지 않는 AI입니다. openai 또는 gemini를 선택하세요."
    )