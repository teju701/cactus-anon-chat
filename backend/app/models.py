# backend/app/models.py

from pydantic import BaseModel, Field
from typing import Optional

class QueueJoinRequest(BaseModel):
    device_id: str
    gender: str
    filter: str
    nickname: str = Field(..., min_length=1, max_length=50)
    bio: Optional[str] = Field(default="", max_length=120)  # ✅ FIX: Make bio optional