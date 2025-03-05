from fastapi import APIRouter

from app.api.endpoints import completions, slides, webhooks, repositories

api_router = APIRouter()
api_router.include_router(completions.router, tags=["completions"])
api_router.include_router(repositories.router, tags=["repositories"])
api_router.include_router(slides.router, tags=["slides"])
api_router.include_router(webhooks.router, tags=["webhooks"])