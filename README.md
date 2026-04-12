# 🚀 ExamCoach – MERN Stack Application

Application Framework 3rd year project. Coded using MERN stack for CRUD operations including Study Material, Mock Quiz, Progress Tracking, Feedback, and Forum.

---

## 🎨 Project Overview

# 🛠️ Tech Stack

* **Frontend:** React.js, Bootstrap
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Other:** API calls, dotenv

---

## 🌐 3rd Party APIs

* Email (Brevo SMTP)
* GIF API (Klipy)
* Open Trivia Database (Quiz Questions)

---

# 🏗️ System Architecture

## 📂 Folder Structure

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

---

# ✨ Features

## 📚 Study Material

* Upload & manage subject-wise notes
* View/download resources

## 📝 Mock Exams

* Quizzes by difficulty level
* Auto scoring system
* Performance history tracking
* Score analytics per subject

## 💬 Feedback System

* Student feedback submission
* Admin review

## 💭 Forum

* Post questions
* Comment and interact

---

## 🔐 Authentication

* JWT-based authentication
* Password hashing using bcrypt
* Role-based access (Student / Admin)
* Secure HTTP-only token storage (if used)

---

# 🔄 Application Flow


## ⚠️ Error Handling

APIs return errors in this format:

```json
{
  "message": "Error description",
  "success": false
}
```

---

# ⚙️ Setup Instructions (Step-by-Step)

## 🔹 1. Clone the Repository

```bash
git clone https://github.com/your-username/examcoach.git
cd examcoach
```

---

## 🔹 2. Setup Backend

```bash
cd backend
npm install
```

### 📄 Create `.env` file

**Frontend**

```env
VITE_API_URL=http://localhost:8888
VITE_KLIPY_API_KEY=your api key
```

**Backend**

```env
PORT=8888

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_login_email
SMTP_PASS=your_brevo_smtp_key
SENDER_EMAIL=your_verified_sender_email@example.com
SENDER_NAME=ExamCoach Support

CLIENT_URL=http://localhost:3000

NODE_ENV=development
```

### ▶️ Run Backend

```bash
npm run dev
```

---

## 🔹 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔹 4. Access Application

* Frontend: http://localhost:5173
* Backend API: http://localhost:8888/api

---

# 🔐 Authentication

```
Authorization: Bearer <JWT_TOKEN>
```

---

# 📂 API Endpoint Documentation

---

# 🧩 1. Exam Level API

## ➤ Create Exam Level

**POST** `/api/exam-levels`

```json
{
  "name": "Easy",
  "code": "EASY",
  "description": "Beginner level"
}
```

---

## ➤ Get All Exam Levels

**GET** `/api/exam-levels`

---

## ➤ Get Exam Level by ID

**GET** `/api/exam-levels/:id`

---

## ➤ Update Exam Level

**PUT** `/api/exam-levels/:id`

---

## ➤ Delete Exam Level

**DELETE** `/api/exam-levels/:id`

---

# 🧩 2. Exam API

## ➤ Submit Exam

**POST** `/api/exams/submit`

```json
{
  "userId": "69d9282fe87b327fee57e128",
  "level": "Easy",
  "subject": "Math",
  "score": 85
}
```

---

## ➤ Get User Exams

**GET** `/api/exams/user/:userId`

---

## ➤ Get Exam by Filters

**GET** `/api/exams?userId=xxx&level=Easy&subject=Math`

---

# ⚠️ Constraints & Notes

## 🔹 Unique Constraint

```js
examSchema.index({ userId: 1, level: 1, subject: 1 }, { unique: true })
```

👉 Prevents duplicate records per user + level + subject

---

## 🔹 Recommended Improvement

```js
await Exam.findOneAndUpdate(
  { userId, level, subject },
  { score, submittedAt: new Date() },
  { upsert: true, new: true }
)
```

---

# 🧪 Example cURL

```bash
curl -X POST http://localhost:8888/api/exam-levels \
-H "Content-Type: application/json" \
-d '{
  "name": "Easy",
  "code": "EASY",
  "description": "Beginner level"
}'
```

---

# 📌 Summary

✔ Full MERN stack project
✔ RESTful API design
✔ CRUD operations for exam levels
✔ Exam submission & tracking
✔ Integrated external APIs
✔ Ready for deployment

---
