# SpendSmart REST API Documentation

Base URL: `http://localhost:5000/api`

SpendSmart follows RESTful architectural patterns, returning JSON responses with consistent structures and appropriate HTTP response codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`).

Protected endpoints require the `Authorization` header formatted as:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication APIs (`/api/auth`)

### 1.1 User Registration
* **Endpoint:** `POST /api/auth/register`
* **Access:** Public
* **Request Body:**
```json
{
  "name": "Gautam Kumar",
  "email": "gautam@example.com",
  "password": "password123"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Account registered successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66a01b2c3d4e5f6789012345",
    "name": "Gautam Kumar",
    "email": "gautam@example.com",
    "createdAt": "2026-10-26T12:00:00.000Z"
  }
}
```

### 1.2 User Login
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "gautam@example.com",
  "password": "password123"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66a01b2c3d4e5f6789012345",
    "name": "Gautam Kumar",
    "email": "gautam@example.com",
    "createdAt": "2026-10-26T12:00:00.000Z"
  }
}
```

### 1.3 Get Current User Profile
* **Endpoint:** `GET /api/auth/me`
* **Access:** Private (Bearer Token)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "66a01b2c3d4e5f6789012345",
    "name": "Gautam Kumar",
    "email": "gautam@example.com",
    "createdAt": "2026-10-26T12:00:00.000Z",
    "updatedAt": "2026-10-26T12:00:00.000Z"
  }
}
```

### 1.4 Update Profile & Password
* **Endpoint:** `PUT /api/auth/profile`
* **Access:** Private (Bearer Token)
* **Request Body:**
```json
{
  "name": "Gautam K.",
  "currentPassword": "password123",
  "newPassword": "newsecretpassword"
}
```

---

## 2. Transactions APIs (`/api/transactions`)

### 2.1 Get Categories
* **Endpoint:** `GET /api/transactions/categories`
* **Access:** Private
* **Response (200 OK):**
```json
{
  "success": true,
  "incomeCategories": ["Salary", "Freelance", "Scholarship", "Business", "Other Income"],
  "expenseCategories": ["Food", "Transport", "Education", "Shopping", "Rent", "Bills", "Healthcare", "Entertainment", "Other Expense"]
}
```

### 2.2 Create Transaction
* **Endpoint:** `POST /api/transactions`
* **Access:** Private
* **Request Body:**
```json
{
  "type": "expense",
  "amount": 450,
  "category": "Food",
  "description": "Lunch with college friends",
  "transactionDate": "2026-10-26"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Transaction recorded successfully!",
  "transaction": {
    "_id": "66a01c4f3d4e5f6789012346",
    "userId": "66a01b2c3d4e5f6789012345",
    "type": "expense",
    "amount": 450,
    "category": "Food",
    "description": "Lunch with college friends",
    "transactionDate": "2026-10-26T00:00:00.000Z",
    "createdAt": "2026-10-26T12:05:00.000Z",
    "updatedAt": "2026-10-26T12:05:00.000Z"
  }
}
```

### 2.3 List Transactions with Filters & Sorting
* **Endpoint:** `GET /api/transactions?type=expense&category=Food&startDate=2026-10-01&endDate=2026-10-31&search=Lunch&sortBy=transactionDate&order=desc`
* **Access:** Private

### 2.4 Update Transaction
* **Endpoint:** `PUT /api/transactions/:id`
* **Access:** Private
* **Request Body:** Fields to update (`amount`, `category`, `description`, `type`, `transactionDate`).

### 2.5 Delete Transaction
* **Endpoint:** `DELETE /api/transactions/:id`
* **Access:** Private
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully!"
}
```

---

## 3. Budget Management APIs (`/api/budgets`)

### 3.1 Create Budget Limit
* **Endpoint:** `POST /api/budgets`
* **Access:** Private
* **Request Body:**
```json
{
  "category": "Food",
  "monthlyLimit": 5000,
  "month": 10,
  "year": 2026
}
```

### 3.2 List Budgets with Spending Calculation
* **Endpoint:** `GET /api/budgets?month=10&year=2026`
* **Access:** Private
* **Response (200 OK):**
```json
{
  "success": true,
  "month": 10,
  "year": 2026,
  "count": 1,
  "budgets": [
    {
      "_id": "66a01d5a3d4e5f6789012347",
      "category": "Food",
      "monthlyLimit": 5000,
      "month": 10,
      "year": 2026,
      "spent": 4200,
      "remaining": 800,
      "percentage": 84.0,
      "status": "warning"
    }
  ]
}
```

### 3.3 Update Budget
* **Endpoint:** `PUT /api/budgets/:id`
* **Access:** Private

### 3.4 Delete Budget
* **Endpoint:** `DELETE /api/budgets/:id`
* **Access:** Private

---

## 4. Dashboard & Analytics APIs

### 4.1 Dashboard Summary
* **Endpoint:** `GET /api/dashboard/summary?month=10&year=2026`
* **Access:** Private
* **Response:** Returns totals (`totalIncome`, `totalExpenses`, `balance`, `transactionCount`), category expenses array, recent 5 transactions, budget utilization list, and 6-month trend arrays for charting.

### 4.2 Analytics Monthly Comparison
* **Endpoint:** `GET /api/analytics/monthly?month=10&year=2026`
* **Access:** Private
* **Response:** Returns current month vs previous month totals and percentage changes (`expenseChangePct`, `incomeChangePct`, `highestCategory`).

### 4.3 Analytics Categorical Breakdown
* **Endpoint:** `GET /api/analytics/categories?month=10&year=2026`
* **Access:** Private
* **Response:** Returns sorted category distribution with transaction counts and % share.
