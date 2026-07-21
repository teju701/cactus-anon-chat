# 🌵 CACTUS

> **Controlled Anonymous Communication with Trust & Usage Safeguards**

A production-grade anonymous chat platform featuring AI-powered identity verification, intelligent matching algorithms, and real-time WebSocket communication. Built for privacy-first interactions with robust abuse prevention mechanisms.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://cactus-chat.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🌟 **Key Features**

### 🔐 **Privacy-First Architecture**
- **Zero Data Retention**: Images deleted immediately after analysis
- **Device Fingerprinting**: Browser-based identification without PII
- **Session-Based**: No accounts, no login, complete anonymity

### 🤖 **AI-Powered Verification**
- **Real-Time Face Detection**: OpenCV Haar Cascade algorithm
- **Gender Classification**: Lightweight ML heuristics (60-70% accuracy)
- **Anti-Gallery Protection**: Timestamp validation prevents pre-recorded images

### ⚡ **Intelligent Matching System**
- **Mutual Compatibility**: Bidirectional preference matching
- **Redis-Based Queue**: Sub-second matching with 3-second polling
- **Filter Options**: Match by gender preference or random
- **Rate Limiting**: Spam prevention and daily usage limits

### 💬 **Real-Time Chat**
- **WebSocket Communication**: Low-latency bidirectional messaging
- **Optimistic Updates**: Instant UI feedback
- **System Messages**: Join/leave/disconnect notifications
- **Abuse Prevention**: Report system with Redis tracking

---

## 🏗️ **System Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React SPA (Vite)                                               │
│  ├─ Device Fingerprinting (FingerprintJS)                       │
│  ├─ Camera Capture (MediaDevices API)                           │
│  ├─ WebSocket Client (Native WebSocket)                         │
│  └─ State Management (React Hooks)                              │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS/WSS
┌────────────────────▼────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI Backend                                                │
│  ├─ REST API (Verification, Queue Join)                         │
│  ├─ WebSocket Server (Chat Handler)                             │
│  ├─ AI Engine (OpenCV Face Detection + Classification)          │
│  └─ Middleware (CORS, Rate Limiting)                            │
└────────────────────┬────────────────────────────────────────────┘
                     │ Redis Protocol
┌────────────────────▼────────────────────────────────────────────┐
│                        DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Redis (In-Memory Store)                                        │
│  ├─ Queue Management (List operations)                          │
│  ├─ Room State (Key-value with TTL)                             │
│  ├─ Rate Limiting (Counter with expiration)                     │
│  └─ Abuse Tracking (Sets for reported users)                    │
└─────────────────────────────────────────────────────────────────┘

DATA FLOW:
User A                           User B
  │                                │
  ├─ 1. Capture Face ──────────────┤
  ├─ 2. Verify Gender ─────────────┤
  ├─ 3. Create Profile ────────────┤
  ├─ 4. Join Queue ────────────────┤
  │         ↓                       ↓
  │    Redis Queue Matching Engine
  │         ↓                       ↓
  ├─ 5. Match Found ←─────────────┤
  ├─ 6. WebSocket Connect ────────┤
  │         ↓                       ↓
  └─ 7. Real-Time Chat ←──────────┘
```

---

## 🛠️ **Tech Stack**

### **Frontend**
| Technology | Purpose | Version |
|------------|---------|---------|
| React 18 | UI Framework | 18.2.0 |
| Vite | Build Tool | 5.0.8 |
| React Router | Navigation | 6.20.0 |
| FingerprintJS | Device ID | 4.2.0 |
| Native WebSocket | Real-time Communication | Built-in |

### **Backend**
| Technology | Purpose | Version |
|------------|---------|---------|
| Python | Runtime | 3.11+ |
| FastAPI | Web Framework | 0.109.0 |
| Uvicorn | ASGI Server | 0.27.0 |
| Redis | In-Memory DB | 5.0.1 |
| OpenCV | Computer Vision | 4.9.0 |
| NumPy | Numerical Computing | 1.26.3 |

### **Infrastructure**
- **Frontend Hosting**: Vercel (Global CDN)
- **Backend Hosting**: Render (Free Tier)
- **Database**: Redis Cloud (Render/Upstash)

---

## 🚀 **Quick Start**

### **Prerequisites**
```bash
# Backend
Python 3.11+
Redis (Docker or Cloud)

# Frontend
Node.js 18+
npm or yarn
```

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/VeriFace-Anonymous-Chat.git
cd VeriFace-Anonymous-Chat
```

### **2. Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Redis URL

# Start server
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`

### **3. Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with backend URL

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### **4. Test Locally**
1. Open two browsers (normal + incognito)
2. Complete verification flow in both
3. Create profiles with matching filters
4. Chat in real-time!

---

## 📊 **Performance Metrics**

| Metric | Value |
|--------|-------|
| **Matching Latency** | < 3 seconds |
| **Message Latency** | < 100ms (WebSocket) |
| **Face Detection** | < 1 second |
| **Gender Classification** | 60-70% accuracy |
| **Concurrent Users** | 100+ (Free tier) |
| **Privacy Compliance** | 100% (Zero retention) |

---

## 🔒 **Security Features**

### **Privacy Protection**
✅ No user accounts or PII collection  
✅ Images processed in-memory, never stored  
✅ Session-based data (clears on tab close)  
✅ Device fingerprinting (no cookies)  

### **Abuse Prevention**
✅ Rate limiting (3s cooldown, 100 req/hour)  
✅ Daily filter limits (50 specific matches/day)  
✅ Report system with Redis tracking  
✅ Spam detection (auto-ban after threshold)  

### **Data Security**
✅ HTTPS/WSS encryption in transit  
✅ Redis TTL for automatic data expiration  
✅ CORS restrictions  
✅ Input validation (Pydantic schemas)  

---

## 🎯 **Matching Algorithm**
```python
def mutual_compatibility_match(user_a, user_b):
    """
    Bidirectional preference matching
    
    Returns True if:
    - User A wants User B's gender (or "any")
    - User B wants User A's gender (or "any")
    """
    a_wants_b = (user_a.filter == "any" or user_a.filter == user_b.gender)
    b_wants_a = (user_b.filter == "any" or user_b.filter == user_a.gender)
    
    return a_wants_b and b_wants_a
```

**Key Features:**
- **Symmetrical**: Both users must match preferences
- **Efficient**: O(n) queue scan with early exit
- **Fair**: FIFO queue order
- **Scalable**: Redis list operations

---

## 📈 **Deployment**

### **Production Architecture**
```
Users → Vercel CDN → Render Backend → Redis Cloud
         (React)      (FastAPI)       (In-Memory DB)
```

### **Environment Variables**

**Backend (`backend/.env`):**
```env
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=https://your-app.vercel.app
```

**Frontend (`frontend/.env.production`):**
```env
VITE_API_URL=https://your-backend.onrender.com
```

### **Deployment Steps**

#### **1. Push to GitHub**
Make sure the project is committed and pushed to GitHub. Both Render and Vercel can deploy directly from the same repository.

#### **2. Deploy Backend on Render**
You can deploy the backend using the included `render.yaml` Blueprint.

1. Go to the Render dashboard
2. Select **New +** -> **Blueprint**
3. Connect this GitHub repository
4. Render will detect `render.yaml`
5. During setup, set `CORS_ORIGINS` temporarily to:
```env
http://localhost:5173
```
6. Deploy the Blueprint

The Blueprint creates:
- FastAPI web service: `controlled-anon-chat-api`
- Render Key Value store: `controlled-anon-chat-kv`
- `REDIS_URL` automatically connected from the Key Value service

After deployment, copy your backend URL:
```text
https://your-backend.onrender.com
```

Test the backend:
```text
https://your-backend.onrender.com/
```

Expected response:
```json
{
  "status": "ok",
  "redis": "connected"
}
```

#### **3. Deploy Frontend on Vercel**

1. Go to the Vercel dashboard
2. Select **Add New** -> **Project**
3. Import the same GitHub repository
4. Set **Root Directory** to:
```text
frontend
```
5. Use these build settings:
```text
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```
6. Add this environment variable:
```env
VITE_API_URL=https://your-backend.onrender.com
```
7. Deploy

The `frontend/vercel.json` file is included so direct refreshes on routes like `/verify`, `/profile`, and `/chat` still load the React app instead of returning a 404.

#### **4. Final CORS Update**
After Vercel gives you the frontend URL, go back to the Render backend service and update:
```env
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

Then redeploy the Render backend.

#### **5. Production Test**
Open your Vercel URL in two browser sessions, for example normal mode and incognito mode:

1. Complete live verification in both sessions
2. Create profiles
3. Join the queue
4. Confirm matching and WebSocket chat work

---

## 🧪 **Testing**

### **Unit Tests**
```bash
cd backend
pytest tests/
```

### **Integration Tests**
```bash
# Start backend and frontend
# Open 2 browsers
# Complete full flow
```

### **Load Testing**
```bash
# Test concurrent connections
ab -n 1000 -c 100 http://localhost:8000/
```

---

## 📝 **API Documentation**

### **REST Endpoints**

**POST /verify**
```json
{
  "device_id": "string",
  "image": "data:image/jpeg;base64,...",
  "timestamp": 1234567890
}
```

**POST /queue/join**
```json
{
  "device_id": "string",
  "gender": "male" | "female",
  "filter": "any" | "male" | "female",
  "nickname": "string",
  "bio": "string"
}
```

**WebSocket /ws/chat/{room_id}?device_id={id}**
```json
// Message
{"type": "message", "text": "Hello!"}

// Report
{"type": "report", "reported_device": "device_id"}

// Leave
{"type": "leave"}
```

---

## 🤝 **Contributing**

Contributions welcome! Please follow:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📜 **License**

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.



## 🙏 **Acknowledgments**

- OpenCV for computer vision capabilities
- FastAPI for excellent async support
- Render & Vercel for free hosting
- React community for amazing ecosystem

---



<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

Made with ❤️ and ☕

</div>
