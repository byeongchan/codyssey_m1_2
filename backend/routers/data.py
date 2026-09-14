from fastapi import APIRouter, HTTPException

from models.data import DataCreate, DataUpdate, DataResponse
from services.firebase_service import db

router = APIRouter(
    prefix="/api/data",
    tags=["data"]
)


@router.post("", response_model=DataResponse)
def create_data(data: DataCreate):
    doc_ref = db.collection("data").document()

    document = {
        "date": data.date,
        "value": data.value,
        "memo": data.memo,
    }

    doc_ref.set(document)

    return DataResponse(
        id=doc_ref.id,
        **document
    )


@router.get("", response_model=list[DataResponse])
def get_data():
    documents = db.collection("data").stream()

    result = []

    for doc in documents:
        data = doc.to_dict()

        result.append(
            DataResponse(
                id=doc.id,
                date=data.get("date", ""),
                value=data.get("value", 0),
                memo=data.get("memo", "")
            )
        )

    result.sort(key=lambda x: x.date)

    return result

@router.get("/summary")
def get_data_summary():
    documents = db.collection("data").stream()

    data_list = []

    for doc in documents:
        data = doc.to_dict()

        data_list.append({
            "date": data.get("date", ""),
            "value": float(data.get("value", 0))
        })

    if not data_list:
        raise HTTPException(
            status_code=404,
            detail="분석할 데이터가 없습니다."
        )

    # 날짜순 정렬
    data_list.sort(key=lambda x: x["date"])

    values = [item["value"] for item in data_list]

    # 기본 통계
    count = len(values)
    average = sum(values) / count
    minimum = min(values)
    maximum = max(values)

    # 최근 추세 계산
    recent_count = min(10, count)
    recent_values = values[-recent_count:]

    if recent_values[-1] > recent_values[0]:
        trend = "상승"
    elif recent_values[-1] < recent_values[0]:
        trend = "하락"
    else:
        trend = "보합"

    data_range = maximum - minimum

    return {
        "period": {
            "start": data_list[0]["date"],
            "end": data_list[-1]["date"]
        },
        "count": count,
        "statistics": {
            "average": round(average, 2),
            "minimum": round(minimum, 2),
            "maximum": round(maximum, 2),
            "range": round(data_range, 2)
        },
        "recent_trend": trend
    }

@router.put("/{data_id}", response_model=DataResponse)
def update_data(data_id: str, data: DataUpdate):
    doc_ref = db.collection("data").document(data_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=404,
            detail="데이터를 찾을 수 없습니다."
        )

    update_fields = data.model_dump(exclude_none=True)

    if update_fields:
        doc_ref.update(update_fields)

    updated_doc = doc_ref.get()
    updated_data = updated_doc.to_dict()

    return DataResponse(
        id=updated_doc.id,
        date=updated_data.get("date", ""),
        value=updated_data.get("value", 0),
        memo=updated_data.get("memo", "")
    )


@router.delete("/{data_id}")
def delete_data(data_id: str):
    doc_ref = db.collection("data").document(data_id)

    if not doc_ref.get().exists:
        raise HTTPException(
            status_code=404,
            detail="데이터를 찾을 수 없습니다."
        )

    doc_ref.delete()

    return {
        "message": "데이터가 삭제되었습니다.",
        "id": data_id
    }

