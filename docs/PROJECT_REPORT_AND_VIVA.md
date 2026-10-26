# SpendSmart — MCA Technical Training Academic Report & Viva Guide

---

## 1. Project Abstract
**SpendSmart** is an automated personal expense and budget management system architected using the MERN stack (MongoDB, Express.js, React, Node.js) and Bootstrap 5. In modern personal economics, individuals often struggle to monitor discretionary spending, adhere to monthly budget allocations, and analyze savings patterns. SpendSmart addresses these challenges by offering secure user authentication (JWT and bcryptjs), intuitive transaction tracking (Income vs. Expense), monthly category budget limits with automated visual alerts (80% threshold warning and 100% breach notification), and descriptive graphical analytics powered by Chart.js. Strict multi-user data isolation ensures personal financial confidentiality.

---

## 2. Introduction & Problem Statement
### Problem Statement
Traditional methods of personal bookkeeping (e.g., physical diaries or generic spreadsheets) are cumbersome, lack real-time calculations, fail to issue preventive overspending alerts, and offer limited visual insights. While commercial banking apps log account balances, they do not provide unified cash and cross-account category budgeting.

### Proposed Solution
SpendSmart provides a centralized web dashboard that automates income/expense ledger balancing (`Balance = Income - Expense`), visually illustrates 6-month trends and categorical distributions, warns users before budgets are exceeded, and delivers a clean, responsive user experience in Indian Rupees (₹).

---

## 3. Comparison: Existing vs. Proposed System

| Feature | Existing Manual / Spreadsheet System | Proposed SpendSmart Application |
|---|---|---|
| **Data Entry** | Manual paper log or complex formula entry | Intuitive, responsive web forms with validation |
| **Real-time Balance** | Requires manual summation formulas | Auto-computed on every transaction entry |
| **Budget Warnings** | No active warnings; realized only after month-end | Real-time threshold alerts at 80% and 100% breach |
| **Security & Privacy** | Files left unencrypted on local disks | JWT bearer authentication & salted bcrypt hashing |
| **Visual Analysis** | Requires manually creating Excel charts | Dynamic Bar & Doughnut charts via Chart.js |
| **Data Integrity** | Vulnerable to accidental formula overwrites | Mongoose schema validation & compound indexes |

---

## 4. Hardware and Software Requirements
### Software Requirements
- **Operating System:** Windows 10/11, Linux, or macOS
- **Runtime Environment:** Node.js (v18.x or v20.x), npm (v9.x+)
- **Database:** MongoDB Community Server 6.0+ or MongoDB Atlas
- **Frontend Framework:** React 18 with Vite build tool
- **Styling:** Bootstrap 5.3 & Bootstrap Icons
- **API Client for Testing:** Postman v10+
- **Code Editor:** Visual Studio Code

### Hardware Requirements
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher
- **RAM:** Minimum 4 GB (8 GB recommended)
- **Disk Storage:** At least 500 MB free space for code and node_modules

---

## 5. System Architecture & Diagrams

### 5.1 System Architecture Diagram
```
+---------------------------------------------------------+
|                  CLIENT TIER (React 18)                 |
|  - Bootstrap 5 Responsive UI (Navbar, Sidebar, Cards)   |
|  - React Router (Protected Routes)                      |
|  - Chart.js Visualizations (Bar & Doughnut Charts)      |
|  - Axios HTTP Client with JWT Interceptors              |
+----------------------------+----------------------------+
                             |
                   HTTPS / JSON REST API
                             |
+----------------------------v----------------------------+
|             APPLICATION SERVER TIER (Node & Express)    |
|  - Express App & REST Routers                           |
|  - Rate Limiter & CORS Security                         |
|  - JWT Auth Middleware & User Ownership Verifier        |
|  - Business Logic Controllers (Auth, Tx, Budget, Dash)  |
+----------------------------+----------------------------+
                             |
                     Mongoose ODM Queries
                             |
+----------------------------v----------------------------+
|                  DATABASE TIER (MongoDB)                |
|  - Users Collection (Hashed passwords, unique emails)   |
|  - Transactions Collection (Indexed by userId & date)   |
|  - Budgets Collection (Unique user-category-month index)|
+---------------------------------------------------------+
```

### 5.2 Database Entity-Relationship (ER) Schema
```
   +-------------------+              +-------------------------+
   |       USER        | 1          * |       TRANSACTION       |
   +-------------------+--------------+-------------------------+
   | _id (PK)          |              | _id (PK)                |
   | name              |              | userId (FK -> User._id) |
   | email (Unique)    |              | type (income / expense) |
   | passwordHash      |              | amount (Number > 0)     |
   | createdAt         |              | category (String)       |
   | updatedAt         |              | description (String)    |
   +-------------------+              | transactionDate (Date)  |
             | 1                      +-------------------------+
             |
             | *
   +-------------------------+
   |         BUDGET          |
   +-------------------------+
   | _id (PK)                |
   | userId (FK -> User._id) |
   | category (String)       |
   | monthlyLimit (Number)   |
   | month (1-12)            |
   | year (Number)           |
   | (Unique: userId+cat+m+y)|
   +-------------------------+
```

---

## 6. Project Modules Description
1. **User Authentication Module:** Manages registration, login, token generation via `jsonwebtoken`, and password hashing via `bcryptjs`. Protected routes reject unauthorized requests.
2. **Dashboard Module:** Gathers monthly transactions, aggregates totals (`Income`, `Expenses`, `Balance`), renders 6-month historical trends, and issues proactive warnings for budgets approaching limits.
3. **Transaction Management Module:** Full CRUD operations allowing users to record, update, search, and delete entries. Enforces date sorting and positive amount validation.
4. **Budget & Limit Module:** Allows monthly limit setting per category. Computes dynamic percentage usage using expense transactions only.
5. **Reports & Analytics Module:** Compares monthly spend vs previous month and renders category expense distribution charts.
6. **Profile & Settings Module:** Allows name and password changes with current password confirmation.

---

## 7. 8-10 Slide Presentation Outline (Viva / Seminar)

* **Slide 1:** **Title Slide** — SpendSmart: Smart Expense & Budget Manager. Candidate details, MCA Technical Training.
* **Slide 2:** **Motivation & Problem Statement** — Lack of proactive expense tracking and budget awareness among students and young professionals.
* **Slide 3:** **Objectives** — Automated cash flow computation, categorical budgeting, visual analysis, secure personal data isolation.
* **Slide 4:** **Technology Stack** — React 18, Bootstrap 5, Express.js, Node.js, MongoDB, Chart.js.
* **Slide 5:** **System Architecture** — 3-Tier architecture flow (Client -> REST API -> MongoDB).
* **Slide 6:** **Key Features & Innovation** — Dual-stage budget threshold alerts (80% warning, 100% breach) and 6-month historical trend graphs.
* **Slide 7:** **Database Design & Security** — Normalized Mongoose schema, compound indexing, bcrypt hashing, JWT validation.
* **Slide 8:** **Demonstration & Live Results** — Walkthrough of Dashboard, Transaction Filter/Search, Budget Cards, and Analytics.
* **Slide 9:** **Limitations & Future Scope** — CSV/PDF statement export, recurring bill notifications, multi-currency support.
* **Slide 10:** **Conclusion & Q&A** — Summary of project outcomes and thank you slide.

---

## 8. High-Yield Viva Questions and Answers

### Q1: Why did you choose JWT over server-side session cookies?
**Answer:** JWT (JSON Web Tokens) provides a stateless authentication mechanism. The server does not need to allocate server memory or maintain session tables in a Redis store. The client securely stores the signed token and transmits it via the `Authorization: Bearer` header, making the API scalable and decoupled.

### Q2: How does the application enforce that User A cannot see User B's transactions?
**Answer:** The server never trusts client-supplied user identifiers. The `protect` middleware decodes the JWT token, verifies the cryptographic signature, and extracts `req.user._id`. All transaction and budget queries filter by `{ userId: req.user._id }`. In addition, `PUT` and `DELETE` endpoints verify that `record.userId.toString() === req.user._id.toString()`, returning `403 Forbidden` on unauthorized attempts.

### Q3: How is the budget utilization percentage calculated?
**Answer:**
$$\text{Budget Usage (\%)} = \left(\frac{\sum \text{Expenses in Category for Month}}{\text{Monthly Budget Limit}}\right) \times 100$$
The calculation uses MongoDB aggregation to filter only transactions where `type == 'expense'`, excluding income entries.

### Q4: Why is password hashing done with bcrypt rather than MD5 or SHA-256?
**Answer:** MD5 and standard SHA algorithms are general-purpose cryptographic hash functions designed to be fast, making them vulnerable to brute-force and rainbow table attacks. `bcrypt` incorporates a salt and an adaptive work factor (iteration count), intentionally introducing computational cost to thwart hardware-accelerated attacks.

### Q5: How do you prevent duplicate budgets for the same category in a given month?
**Answer:** In Mongoose, we established a compound unique index:
`budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });`
This is validated both at the application controller level and enforced at the database index level.
