# SpendSmart — Smart Expense & Budget Manager
**MCA Technical Training Postgraduate Project**

[![MERN Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Express%20%7C%20MongoDB-blue.svg)](https://nodejs.org)
[![Bootstrap 5](https://img.shields.io/badge/UI-Bootstrap%205-purple.svg)](https://getbootstrap.com)
[![JWT Auth](https://img.shields.io/badge/Security-JWT%20%2B%20Bcrypt-green.svg)](https://jwt.io)

SpendSmart is a full-stack personal finance and budget tracking web application built specifically for postgraduate MCA Technical Training demonstrations. It allows users to record earnings, manage expenses, set category-wise monthly budgets, monitor utilization with color-coded alerts, and view interactive financial analytics.

---

## 1. Key Features
- **User Authentication:** Secure registration and login using JWT tokens and bcrypt password hashing with rate-limiting.
- **Strict Data Isolation:** Multi-tenant database design where users strictly access their own financial records.
- **Dynamic Financial Dashboard:** Real-time summary cards for Total Income, Total Expenses, Net Balance, and Transaction Count.
- **Visual Analytics:** Interactive 6-month trend bar charts and category expense breakdown doughnut charts powered by Chart.js.
- **Budget Tracking & Over-limit Alerts:** Set category limits per month; automatic warnings at 80% and over-budget alerts at 100%.
- **Comprehensive Transaction Management:** Filter by Income/Expense, category, and date range; search by notes; full CRUD operations.
- **Indian Financial Standard:** Currency natively formatted in Indian Rupees (₹ - INR) with standard numeral grouping.

---

## 2. Technology Stack
- **Frontend:** React 18, React Router v6, Bootstrap 5, Bootstrap Icons, Axios, Chart.js, react-chartjs-2, Vite.
- **Backend:** Node.js, Express.js, REST API architecture, express-rate-limit, CORS.
- **Security:** JSON Web Tokens (JWT), bcryptjs for salt hashing.
- **Database:** MongoDB Community Server / MongoDB Atlas with Mongoose ODM.

---

## 3. Installation & Setup Guide (Windows PowerShell)

### Prerequisites
- Node.js (v18+ or v20+) and npm installed.
- MongoDB installed locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string.

### Step 1: Clone / Navigate to Project
```powershell
cd "c:\Users\gauta\OneDrive\Desktop\tt sem 3\food\spendsmart"
```

### Step 2: Configure Environment Variables
Inside `spendsmart/server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/spendsmart_db
JWT_SECRET=spendsmart_mca_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Step 3: Install Dependencies
```powershell
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 4: Run the Application
Open two PowerShell terminals:

**Terminal 1 (Backend API):**
```powershell
cd "spendsmart\server"
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```powershell
cd "spendsmart\client"
npm run dev
# Frontend will run on http://localhost:5173
```

Now open your web browser at **`http://localhost:5173`**.

---

## 4. Documentation Index
- [REST API Documentation](docs/API_DOCUMENTATION.md)
- [Test Cases & QA Validation Matrix](docs/TEST_CASES.md)
- [Academic Report & Viva Guide](docs/PROJECT_REPORT_AND_VIVA.md)
