# SpendSmart — Test Cases & QA Validation Matrix

This document defines the 17 core test cases required for the MCA Technical Training examination, detailing input parameters, expected HTTP responses, and database validation criteria.

---

## REST API Test Cases Matrix (Postman / Automated)

| TC ID | Test Case Objective | Method & Endpoint | Payload / Params | Expected Status & Result | Actual Status |
|---|---|---|---|---|---|
| **TC-01** | Successful User Registration | `POST /api/auth/register` | `{"name":"Gautam","email":"gautam@test.com","password":"password123"}` | `201 Created`, returns JWT token and sanitized user object | PASS |
| **TC-02** | Duplicate Email Registration | `POST /api/auth/register` | Same email `gautam@test.com` | `409 Conflict`, error: "An account with this email address already exists" | PASS |
| **TC-03** | Successful User Login | `POST /api/auth/login` | Correct credentials | `200 OK`, returns new JWT token and user info | PASS |
| **TC-04** | Incorrect Password Login | `POST /api/auth/login` | Wrong password | `401 Unauthorized`, error: "Invalid email or password" | PASS |
| **TC-05** | Input Validation Error (Empty fields / invalid email) | `POST /api/auth/register` | Invalid email format or password < 6 chars | `400 Bad Request`, descriptive validation message | PASS |
| **TC-06** | Access Protected Route Without Token | `GET /api/transactions` | No `Authorization` header | `401 Unauthorized`, error: "Access denied. No authentication token provided." | PASS |
| **TC-07** | Create Income Transaction | `POST /api/transactions` | `{"type":"income","amount":25000,"category":"Salary"}` | `201 Created`, stored with authenticated `userId` | PASS |
| **TC-08** | Create Expense Transaction | `POST /api/transactions` | `{"type":"expense","amount":1200,"category":"Food"}` | `201 Created`, stored with authenticated `userId` | PASS |
| **TC-09** | Edit Transaction | `PUT /api/transactions/:id` | `{"amount":1500,"description":"Updated note"}` | `200 OK`, original record updated without creating duplicate | PASS |
| **TC-10** | Delete Transaction | `DELETE /api/transactions/:id` | Target transaction ID | `200 OK`, record deleted from DB | PASS |
| **TC-11** | Filter Transactions by Date, Category & Type | `GET /api/transactions` | `?type=expense&category=Food&startDate=...` | `200 OK`, filtered result count and list matching query | PASS |
| **TC-12** | Create Monthly Budget | `POST /api/budgets` | `{"category":"Food","monthlyLimit":5000,"month":10,"year":2026}` | `201 Created`, budget saved with compound index | PASS |
| **TC-13** | Calculate Budget Usage Correctly | `GET /api/budgets` | `?month=10&year=2026` | `200 OK`, verifies `percentage = (spent / limit) * 100`, flags `warning` at 80% & `exceeded` at 100% | PASS |
| **TC-14** | Dashboard Totals Matching Database Records | `GET /api/dashboard/summary` | `?month=10&year=2026` | `200 OK`, `balance = totalIncome - totalExpenses` matching DB sums | PASS |
| **TC-15** | Cross-User Data Isolation (Unauthorized Access) | `GET /api/transactions/:otherUserId` | User B token attempting to read User A transaction | `403 Forbidden`, error: "Not authorized to access this transaction" | PASS |
| **TC-16** | Non-existent Record IDs | `GET /api/transactions/660000000000000000000000` | Non-existent ObjectId | `404 Not Found`, error: "Transaction not found." | PASS |
| **TC-17** | Invalid / Expired JWT Token | `GET /api/auth/me` | Malformed or expired token string | `401 Unauthorized`, error: "Invalid or expired token" | PASS |

---

## Manual Frontend Testing Checklist

1. **Authentication Flow:**
   - [x] Register new account with validation feedback.
   - [x] Try registering with the same email (assert friendly warning banner).
   - [x] Log in, ensure JWT token is saved in localStorage.
   - [x] Try accessing `/dashboard` directly while logged out (redirects to `/login`).
   - [x] Click logout in sidebar (token cleared, redirected to `/login`).

2. **Dashboard Calculations:**
   - [x] Empty state display when zero transactions exist.
   - [x] Income and Expense totals update automatically when month selector is changed.
   - [x] Net balance calculates as `Total Income - Total Expenses`.
   - [x] Over-budget warning banner appears when an expense category surpasses 80% and 100%.

3. **Transaction Management:**
   - [x] Add Income transaction (appears with green badge `+ ₹...`).
   - [x] Add Expense transaction (appears with red badge `- ₹...`).
   - [x] Search transactions dynamically by text in description.
   - [x] Filter by category, type (Income/Expense), and date range.
   - [x] Edit transaction amount and note.
   - [x] Delete transaction with confirmation dialog; verify dashboard totals reflect update immediately.

4. **Budget Management:**
   - [x] Add monthly budget limit for a category.
   - [x] Try setting duplicate budget for same category/month (prevented with message).
   - [x] Verify progress bar color transitions: Blue (<80%) -> Yellow (>=80%) -> Red (>=100%).
   - [x] Edit monthly limit and confirm recalculation.
