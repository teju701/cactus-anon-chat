# backend/app/config.py

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# =====================
# Redis
# =====================
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# =====================
# Verification
# =====================
IMAGE_MAX_AGE_MS = int(os.getenv("IMAGE_MAX_AGE_MS", "10000"))

# =====================
# Abuse prevention
# =====================
QUEUE_COOLDOWN_SECONDS = int(os.getenv("QUEUE_COOLDOWN_SECONDS", "3"))
DAILY_FILTER_LIMIT = int(os.getenv("DAILY_FILTER_LIMIT", "50"))
SPAM_THRESHOLD = int(os.getenv("SPAM_THRESHOLD", "100"))
MAX_REPORTS_BEFORE_FLAG = int(os.getenv("MAX_REPORTS_BEFORE_FLAG", "3"))

# =====================
# Rooms / Queue
# =====================
ROOM_EXPIRY_SECONDS = int(os.getenv("ROOM_EXPIRY_SECONDS", "3600"))
QUEUE_EXPIRY_SECONDS = int(os.getenv("QUEUE_EXPIRY_SECONDS", "300"))

# =====================
# CORS
# =====================
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

# =====================
# Server
# =====================
DEBUG = os.getenv("DEBUG", "true").lower() == "true"