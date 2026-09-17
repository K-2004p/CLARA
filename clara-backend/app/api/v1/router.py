from fastapi import APIRouter
from app.api.v1.endpoints import analyze, chat, upload, history, report

api_router = APIRouter()
api_router.include_router(analyze.router, tags=["analyze"])
api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(upload.router, tags=["upload"])
api_router.include_router(history.router, tags=["history"])
api_router.include_router(report.router, tags=["report"])
