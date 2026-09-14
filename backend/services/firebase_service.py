import json
import os

import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv


load_dotenv()


def initialize_firebase():
    if firebase_admin._apps:
        return firestore.client()

    firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

    if not firebase_json:
        raise ValueError(
            "FIREBASE_SERVICE_ACCOUNT_JSON 환경변수가 설정되지 않았습니다."
        )

    try:
        service_account_info = json.loads(firebase_json)
    except json.JSONDecodeError as e:
        raise ValueError(
            "FIREBASE_SERVICE_ACCOUNT_JSON이 올바른 JSON 형식이 아닙니다."
        ) from e

    credential = credentials.Certificate(service_account_info)

    firebase_admin.initialize_app(credential)

    return firestore.client()


db = initialize_firebase()