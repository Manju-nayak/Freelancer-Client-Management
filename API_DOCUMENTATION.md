# FreelanceHub — REST API Documentation

Base URL: `http://localhost:5000`

All endpoints requiring authentication expect a standard HTTP Header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### 1.1 User Registration
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Sarah Jenkins",
  "email": "client@acmecorp.com",
  "password": "client123",
  "role": "client", // "client" | "freelancer" | "admin"
  "companyName": "Acme Innovations",
  "industry": "FinTech"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Account registered successfully!",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 2,
    "name": "Sarah Jenkins",
    "email": "client@acmecorp.com",
    "role": "client"
  }
}
```

### 1.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "client@acmecorp.com",
  "password": "client123"
}
```
- **Response (200 OK):** Returns JWT token and user profile details.

### 1.3 Get Current User Session
- **Endpoint:** `GET /api/auth/me`
- **Access:** Protected (All Roles)

---

## 2. Project Endpoints

### 2.1 Browse Projects (with Full-Text Search & Filters)
- **Endpoint:** `GET /api/projects`
- **Access:** Public / Protected
- **Query Parameters:**
  - `q`: Search keyword (PostgreSQL GIN tsvector search)
  - `category`: Category filter
  - `status`: Status filter (`open`, `in-progress`, `completed`)
  - `minBudget`: Minimum budget
  - `maxBudget`: Maximum budget
- **Response (200 OK):**
```json
{
  "success": true,
  "total": 5,
  "count": 5,
  "projects": [
    {
      "id": 1,
      "title": "Enterprise Financial Analytics Dashboard",
      "category": "Full-Stack Development",
      "budget": 4500,
      "budget_type": "fixed",
      "deadline": "2026-12-17",
      "status": "in-progress",
      "client_name": "Sarah Jenkins",
      "proposals_count": 2,
      "skills": ["React", "Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"]
    }
  ]
}
```

### 2.2 Get AI-Recommended Projects for Freelancer
- **Endpoint:** `GET /api/projects/recommendations`
- **Access:** Protected (Freelancer only)
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "recommendations": [
    {
      "id": 5,
      "title": "Automated Data Pipeline & Warehouse ETL",
      "category": "Database Engineering",
      "budget": 5200,
      "match_score": "50.9"
    }
  ]
}
```

### 2.3 Get AI-Recommended Freelancers for Project
- **Endpoint:** `GET /api/projects/:id/freelancers`
- **Access:** Protected (Client only)
- **Response (200 OK):** Returns top freelancers ranked by pgvector cosine similarity.

### 2.4 Create New Project
- **Endpoint:** `POST /api/projects`
- **Access:** Protected (Client only)
- **Payload:** `title`, `description`, `category`, `budget`, `budgetType`, `deadline`, `experienceLevel`, `skillsRequired`.

---

## 3. Proposal Endpoints

### 3.1 Submit Proposal
- **Endpoint:** `POST /api/proposals`
- **Access:** Protected (Freelancer only)
- **Payload:** `projectId`, `coverLetter`, `proposedBudget`, `estimatedDuration`.

### 3.2 Get My Proposals
- **Endpoint:** `GET /api/proposals/my-proposals`
- **Access:** Protected (Freelancer only)

### 3.3 Get Proposals for Client Project
- **Endpoint:** `GET /api/proposals/project/:projectId`
- **Access:** Protected (Client only)

### 3.4 Accept or Reject Proposal (ACID Transaction)
- **Endpoint:** `PATCH /api/proposals/:id/status`
- **Access:** Protected (Client owner only)
- **Payload:**
```json
{
  "status": "accepted" // or "rejected"
}
```
- **Operation:** When accepted, executes a PostgreSQL transaction that assigns the freelancer, sets the project to `in-progress`, rejects competing pending proposals, creates a milestone, and logs an audit trail.

---

## 4. Payment Endpoints

### 4.1 Process Milestone Payment (ACID Transaction)
- **Endpoint:** `POST /api/payments`
- **Access:** Protected (Client only)
- **Payload:**
```json
{
  "projectId": 1,
  "freelancerId": 4,
  "milestoneId": 2,
  "amount": 1500.00,
  "paymentMethod": "UPI" // "UPI" | "Credit Card" | "Bank Transfer" | "Escrow"
}
```

### 4.2 Get Client Payment Ledger
- **Endpoint:** `GET /api/payments/client`
- **Access:** Protected (Client only)

### 4.3 Get Freelancer Earnings Ledger
- **Endpoint:** `GET /api/payments/freelancer`
- **Access:** Protected (Freelancer only)

---

## 5. Review & Rating Endpoints

### 5.1 Submit Review
- **Endpoint:** `POST /api/reviews`
- **Access:** Protected
- **Payload:**
```json
{
  "projectId": 1,
  "revieweeId": 4,
  "rating": 5,
  "comment": "Exceptional engineering quality! Delivered ahead of deadline."
}
```
- **Behavior:** Inserting a review immediately triggers PostgreSQL trigger `trg_review_update_rating` which recomputes the freelancer's weighted average rating and rating count.

---

## 6. Analytics Endpoints

### 6.1 Client Dashboard Analytics
- **Endpoint:** `GET /api/analytics/client`
- **Access:** Protected (Client only)

### 6.2 Freelancer Dashboard Analytics
- **Endpoint:** `GET /api/analytics/freelancer`
- **Access:** Protected (Freelancer only)

### 6.3 Admin Dashboard Analytics
- **Endpoint:** `GET /api/analytics/admin`
- **Access:** Protected (Admin only)

---

## 7. Admin & DBMS Demonstrator Endpoints

### 7.1 Manage Users
- **Endpoint:** `GET /api/admin/users`
- **Endpoint:** `PATCH /api/admin/users/:id/toggle-status`

### 7.2 System Audit Trail
- **Endpoint:** `GET /api/admin/audit-logs`

### 7.3 DBMS Query Demonstrator Runner
- **Endpoint:** `POST /api/admin/db-query-demo`
- **Access:** Protected (Admin only)
- **Payload:**
```json
{
  "queryType": "multi_table_join", // or "subquery_aggregation", "view_inspection", "full_text_search", "vector_similarity"
  "customSql": null // optional custom SQL string
}
```
- **Response:** Returns execution time in milliseconds, column headers, row counts, and result rows.
