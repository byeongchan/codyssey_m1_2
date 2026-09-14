from datetime import date, timedelta
import random

from services.firebase_service import db


def seed_data():
    collection = db.collection("data")

    start_date = date(2026, 5, 1)

    value = 100.0

    for i in range(120):
        current_date = start_date + timedelta(days=i)

        # 약간의 상승/하락을 포함한 시계열 데이터 생성
        value += random.uniform(-3, 3)

        document = {
            "date": current_date.isoformat(),
            "value": round(value, 2),
            "memo": f"시계열 테스트 데이터 {i + 1}"
        }

        collection.add(document)

    print("120개의 데이터가 추가되었습니다.")


if __name__ == "__main__":
    seed_data()