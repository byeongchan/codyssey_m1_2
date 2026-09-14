from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.firebase_service import db
from routers import data
from routers import chat
from routers import conversations

app = FastAPI(
    title="AI Data Chatbot API",
    description="시계열 데이터를 기반으로 AI 분석을 제공하는 API",
    version="1.0.0",
)

app.include_router(data.router)
app.include_router(chat.router)
app.include_router(conversations.router)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Data Chatbot API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }

@app.get("/firebase-test")
def firebase_test():
    test_ref = db.collection("data").limit(1).stream()

    documents = list(test_ref)

    return {
        "status": "ok",
        "firebase": "connected",
        "documents_found": len(documents)
    }