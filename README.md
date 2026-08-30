# 🎓 College Complaint Management System (CampusCare)

A modern full-stack web application designed for colleges and universities to digitally manage student complaints, campus facility work orders, real-time status progressions, and student feedback ratings.

Built according to the single source of truth specification in [`spec.md`](./spec.md).

---

## 🌟 Key Features

### 👤 Student Portal
- **Secure Authentication**: Student registration and login with JWT & bcrypt password hashing.
- **Smart Complaint Submission**:
  - **AI Category Suggestion**: Automatically classifies issues (Classrooms, Labs, Hostels, Wi-Fi, Infrastructure, Cleanliness, Transportation) with instant keyword & LLM fallbacks.
  - **Duplicate Detection**: Real-time warning if a similar active complaint already exists in the same facility location before submission.
  - **AI Summary Generation**: Automatic concise summarization of lengthy descriptions.
  - **Image Attachment**: Photo evidence upload with automatic image classification fallback.
- **Visual Status Timeline**: Track issues across the 6-stage lifecycle (`Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`).
- **Real-Time Updates**: Instant Socket.IO notifications for status changes, admin updates, and assignments.
- **Feedback & Rating**: Rate resolved complaints with 1–5 stars and submit satisfaction feedback.

### 🛡️ Admin & Operations Portal
- **Central Analytics Dashboard**: Real-time metrics for total tickets, pending reviews, active work orders, resolution rates, and overdue escalations.
- **Department & Category Breakdown**: Track volume and performance across IT, Maintenance, Hostel, Transport, Housekeeping, and Lab departments.
- **Resolution Time Analytics**: Calculate average, fastest, and longest resolution times.
- **Advanced Ticket Management**: Multi-filter by Status, Category, Priority, Department, and Escalation flag; search across IDs (`CMP-001`), titles, and student names.
- **Staff & Department Routing**: Predefined staff assignment per department (e.g. IT Administrator, Maintenance Officer, Hostel Warden).
- **Chronological Activity Logs**: Append admin comments and updates that sync directly to the student's timeline.
- **Auto-Escalation**: Highlights tickets exceeding priority thresholds (Critical: 24h, High: 48h, Medium: 72h, Low: 7d).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Axios, Socket.IO Client, Lucide React
- **Backend**: Node.js, Express.js, Mongoose, Socket.IO, JWT, bcryptjs, Helmet, CORS, Multer, Nodemailer
- **Database**: MongoDB Atlas (with zero-config embedded local MongoDB fallback for local development)
- **Deployment**: Vercel (Frontend SPA) + Render (Backend Web Service)

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)

---

### 2. Installation

Clone or open the project folder in your terminal:

```bash
# Install all root, backend, and frontend dependencies
npm run install:all
```

*Or install individually:*
```bash
cd server && npm install
cd ../client && npm install
```

---

### 3. Environment Variables

#### Backend (`server/.env`)
Create or edit `server/.env` (a ready-to-run template is included):

```env
PORT=5000
NODE_ENV=development

# Database (Leave empty for zero-config embedded local database, or provide MongoDB Atlas URI)
MONGODB_URI=

# Security
JWT_SECRET=college_complaint_management_jwt_secret_dev_key_2026
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:5173

# Optional: Nodemailer Email Notification (Safe fallback active if omitted)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM="College Helpdesk" <no-reply@college.edu>

# Optional: AI Categorization & Summaries (Deterministic rules fallback active if omitted)
GEMINI_API_KEY=
OPENROUTER_API_KEY=
```

#### Frontend (`client/.env`)
Create or edit `client/.env`:

```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### 4. Seed Demo Data (Optional but Recommended)

Populate the database with demo users, complaints across all lifecycle stages, admin updates, and notifications:

```bash
npm run seed
```

---

### 5. Running the Application Locally

Run the backend and frontend in separate terminals:

#### Terminal 1 — Backend Server
```bash
npm run server
# Server starts at: http://localhost:5000
# Health check: http://localhost:5000/api/health
```

#### Terminal 2 — Frontend Client
```bash
npm run client
# Client opens at: http://localhost:5173
```

Now open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 🔑 Demo Login Credentials

The application includes 1-click demo buttons on the login page, or you can log in manually with:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `Admin@123` | Full admin analytics, ticket management, assignment, resolution |
| **Student (Alex)** | `alex@college.edu` | `Student@123` | Student dashboard, file complaints, view timeline, rate resolutions |
| **Student (Priya)** | `priya@college.edu` | `Student@123` | Student dashboard, file complaints, view timeline, rate resolutions |

*You can also register any new student account directly from the **Register** page.*

---

## 🔄 Complaint Lifecycle Progression

```
[ Student Submits Ticket ]
            ↓
       Submitted
            ↓
     Under Review (Admin reviews & sets priority)
            ↓
       Assigned   (Assigned to IT/Maintenance/Hostel + Staff member)
            ↓
     In Progress  (Staff works on the issue, logs updates)
            ↓
       Resolved   (Admin adds resolution notes; Student notified in real-time)
            ↓
        Closed    (Student rates 1–5 stars & provides satisfaction feedback)
```

---

## 📡 REST API Reference

### Health
- `GET /api/health` — Service health check

### Authentication
- `POST /api/auth/register` — Register student account
- `POST /api/auth/login` — Login user (student / admin)
- `GET /api/auth/me` — Get authenticated user profile
- `POST /api/auth/logout` — Logout user

### Student Complaints
- `POST /api/complaints` — Submit a complaint (with image upload / URL)
- `GET /api/complaints/my` — Get logged-in student's complaints (with search & filters)
- `GET /api/complaints/:id` — Get complaint details & timeline
- `POST /api/complaints/:id/feedback` — Submit 1–5 star rating & feedback

### Admin Management
- `GET /api/admin/complaints` — Get all complaints (with multi-criteria filter & search)
- `GET /api/admin/complaints/:id` — Get complaint details for administration
- `PUT /api/admin/complaints/:id` — Update status, priority, department, assigned staff
- `POST /api/admin/complaints/:id/update` — Add progress comment/update to timeline
- `POST /api/admin/complaints/:id/resolve` — Mark complaint as resolved with details
- `POST /api/admin/complaints/:id/escalate` — Toggle escalation status
- `GET /api/admin/statistics` — Overall counts & resolution time statistics
- `GET /api/admin/statistics/departments` — Department-wise breakdown
- `GET /api/admin/statistics/categories` — Category counts
- `GET /api/admin/statistics/status` — Status breakdown

### Notifications
- `GET /api/notifications` — Get user notifications
- `PUT /api/notifications/:id/read` — Mark notification as read
- `PUT /api/notifications/read-all` — Mark all notifications as read

### AI & Assistant
- `POST /api/ai/categorize` — Suggest category from title & description
- `POST /api/ai/summarize` — Generate concise 1-sentence summary
- `POST /api/ai/check-duplicate` — Check for existing similar complaints
- `POST /api/ai/image-classify` — Tag issue based on category & details

---

## ⚡ Socket.IO Events

| Event | Direction | Description |
| :--- | :--- | :--- |
| `join` | Client ➔ Server | Join user-specific private room |
| `join_admin` | Client ➔ Server | Join admin broadcast room |
| `complaint:created` | Server ➔ Admin | Emitted when new complaint is filed |
| `complaint:updated` | Server ➔ User/Admin | Emitted when status, priority, or notes change |
| `complaint:resolved` | Server ➔ User/Admin | Emitted when ticket is resolved |
| `complaint:escalated`| Server ➔ Admin | Emitted when ticket is marked as overdue |
| `notification:new` | Server ➔ User | Real-time in-app notification popup |

---

## 🌐 Production Deployment

### Backend on Render
1. Create a **Web Service** on [Render](https://render.com).
2. Connect your repository and set Root Directory to `server`.
3. Set Build Command: `npm install`.
4. Set Start Command: `npm start`.
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string.
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://campuscare.vercel.app`).
   - `NODE_ENV`: `production`

### Frontend on Vercel
1. Create a new project on [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Set Build Command: `npm run build`.
4. Set Output Directory: `dist`.
5. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL (e.g. `https://campuscare-api.onrender.com/api`).
   - `VITE_SOCKET_URL`: Your Render backend URL (e.g. `https://campuscare-api.onrender.com`).
6. Deploy! (`client/vercel.json` already contains SPA routing rewrites).
