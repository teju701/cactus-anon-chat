# backend/app/verify_gender.py
import base64
import time
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import IMAGE_MAX_AGE_MS

verify_router = APIRouter()

class VerifyRequest(BaseModel):
    device_id: str
    image: str
    timestamp: int

def classify_gender_from_face(face_region):
    """
    Lightweight gender classification based on facial features.
    Uses OpenCV and heuristics.
    Accuracy: ~60-70%
    """
    gray_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
    
    height, width = gray_face.shape
    aspect_ratio = width / height
    avg_brightness = np.mean(gray_face)
    laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()
    
    upper_face = gray_face[0:int(height*0.3), :]
    upper_brightness = np.mean(upper_face)
    
    lower_face = gray_face[int(height*0.6):, :]
    lower_brightness = np.mean(lower_face)
    
    # Classification score
    score = 0
    
    # Male indicators:
    if aspect_ratio > 0.85:  # Wider face
        score += 1
    
    if laplacian_var > 120:  # Rougher skin texture
        score += 1
    
    if lower_brightness < upper_brightness - 8:  # Stronger jaw shadow
        score += 1
    
    if avg_brightness < 125:  # Darker overall
        score += 1
    
    # Final decision
    gender = "male" if score >= 2 else "female"
    confidence = (score / 4) * 100
    
    return gender, confidence

@verify_router.post("/verify")
def verify(req: VerifyRequest):
    try:
        now_ms = int(time.time() * 1000)
        if now_ms - req.timestamp > IMAGE_MAX_AGE_MS:
            raise HTTPException(400, "Image too old. Please retake photo.")

        _, encoded = req.image.split(",", 1)
        image_bytes = base64.b64decode(encoded)

        np_img = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(400, "Invalid image format")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(100, 100)
        )

        if len(faces) == 0:
            raise HTTPException(400, "No face detected. Please center your face and try again.")

        largest_face = max(faces, key=lambda face: face[2] * face[3])
        x, y, w, h = largest_face
        
        padding = int(w * 0.2)
        y1 = max(0, y - padding)
        y2 = min(img.shape[0], y + h + padding)
        x1 = max(0, x - padding)
        x2 = min(img.shape[1], x + w + padding)
        
        face_region = img[y1:y2, x1:x2]

        gender, confidence = classify_gender_from_face(face_region)
        
        print(f"✅ Gender: {gender} (confidence: {confidence:.1f}%)")
        print(f"   Debug - Score breakdown: aspect={face_region.shape[1]/face_region.shape[0]:.2f}, texture={cv2.Laplacian(cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY), cv2.CV_64F).var():.1f}, brightness={np.mean(cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)):.1f}")

        del img, np_img, image_bytes, gray, face_region

        return {
            "success": True,
            "gender": gender
        }

    except HTTPException:
        raise
        
    except Exception as e:
        print(f"❌ Verification error: {e}")
        raise HTTPException(500, "Verification failed. Please try again.")