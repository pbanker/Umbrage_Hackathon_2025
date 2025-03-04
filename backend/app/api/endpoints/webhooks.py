from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()

@router.post("/webhooks/microsoft")
async def microsoft_webhook(
    payload: dict,
    db: Session = Depends(get_db)
):
    """Webhook endpoint for Microsoft Graph API notifications"""
    # await utils.webhooks.process_microsoft_notification(payload, db)
    return {"status": "success"}