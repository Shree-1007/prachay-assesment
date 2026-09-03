# Enterprise Expense Management System

A full-stack web application designed for enterprise expense voucher management with Role-Based Access Control (RBAC).

## Features
- **3-Tier Role Hierarchy**: Employee, Director, and Accounts
- **Workflow**: Employees submit expense vouchers, Directors approve/reject them, and Accounts processes them.
- **Image Signatures**: Users must upload an image as their signature for voucher submissions and approvals.
- **Authentication**: JWT-based authentication storing secure sessions.
- **Enterprise UI**: Responsive UI built with React, Vite, and TailwindCSS.

## Tech Stack
- **Frontend**: React.js, TypeScript, Vite, TailwindCSS (v3)
- **Backend**: Node.js, Express, TypeScript, SQLite (Zero-config embedded DB for easy evaluation)

---

## 🚀 How to Run the Project Locally

### 1. Backend Setup
The backend runs on an embedded SQLite database, meaning **you do not need to install or configure PostgreSQL**.

Open a terminal and run:
```bash
cd backend
npm install
node setupDb.js   # Generates the local SQLite database & seeds mock users
npm run dev
```
*The API will start on `http://localhost:5000`*

### 2. Frontend Setup
Open a second terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*The UI will start on `http://localhost:5173`*

---

## 🔑 Demo Accounts (Seeded automatically)

You can log in via the Login page using any of these test accounts (password is prefilled for convenience):
- **Employee**: `employee@test.com` (Can Create, Edit, Delete, Submit drafts)
- **Director**: `director@test.com` (Can View all, Approve/Reject submissions)
- **Accounts**: `accounts@test.com` (Read-only access to all vouchers)

---

## Architecture Decisions
- SQLite was chosen over PostgreSQL for the backend to ensure zero-friction setup during the technical assessment evaluation.
- The UI follows an "Enterprise Clean" modern aesthetic, completely mobile-responsive, utilizing Context APIs for global auth state.
- Form data and image uploads are parsed seamlessly via `multer` on the Node.js backend.
