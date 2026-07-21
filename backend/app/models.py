from typing import Literal, Optional

from pydantic import BaseModel, Field


class QueueJoinRequest(BaseModel):
    device_id: str = Field(..., min_length=8, max_length=128)
    gender: Literal["male", "female"]
    filter: Literal["any", "male", "female"]
    nickname: str = Field(..., min_length=1, max_length=50)
    bio: Optional[str] = Field(default="", max_length=120)
