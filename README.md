# ExamCoach
Application Framework 3rd year project. Coded using Mern stack. For main crud parts as Study material, Mock quiz,  Progress tracking and feedback and Forum.

## Tech Stack
- **Frontend:** React.js, Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Other:**  API calls, dotenv

## Folder Structure

```text
ExamCoach/
├── backend/
│   ├── server.js
│   ├── models/
│   ├── routes/
│   └── controllers/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── api/
```

## Features
- **Syllabus and study material:**
- **Feedback and progress tracker:**
- **Mock exam:**
- **Forum:**

## Installation
```bash
git clone https://github.com/sasankathilakaratne/ExamCoach.git
cd ExamCoach

## frontend
cd frontend
npm install
npm start

## backend
cd backend
npm install

##environmental Variables
-**frontend**
VITE_API_URL
-**backend**
# ─── Server ────────────────────────────────────────────────────
PORT

# ─── MongoDB ───────────────────────────────────────────────────
MONGO_URI
# ─── JWT ───────────────────────────────────────────────────────
JWT_SECRET
JWT_EXPIRES_IN

# ─── Email via Brevo SMTP ──────────────────────────────────────
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SENDER_EMAIL
SENDER_NAME

# ─── Client URL (for reset-password links in emails) ──────────
CLIENT_URL

# ─── Environment ───────────────────────────────────────────────
NODE_ENV
