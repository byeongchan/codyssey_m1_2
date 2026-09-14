from pydantic import BaseModel, Field


class DataCreate(BaseModel):
    date: str
    value: float
    memo: str = ""


class DataUpdate(BaseModel):
    date: str | None = None
    value: float | None = None
    memo: str | None = None


class DataResponse(BaseModel):
    id: str
    date: str
    value: float
    memo: str