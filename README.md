# FreelanceHub — Enterprise Freelancer-Client Project Management System
### Advanced DBMS Level 3 Full-Stack Application with PostgreSQL & pgvector

[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![pgvector](https://img.shields.io/badge/Vector%20DB-pgvector-emerald.svg)](https://github.com/pgvector/pgvector)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js%205-lightgrey.svg)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passing-brightgreen.svg)]()

---

## 1. Project Introduction

**FreelanceHub** is a modern, enterprise-grade freelancer-client collaboration and project management platform built to fulfill the rigorous academic and technical criteria of a **DBMS Level 3** project. 

The application utilizes a **Dual Database Paradigm** combining an advanced, fully normalized **Relational DBMS (PostgreSQL)** with an intelligent **Vector Database (pgvector)**. It replaces traditional keyword-only matching with 384-dimensional dense semantic embeddings that compute cosine distances (`<=>`) between freelancer skill profiles and project specifications in real time.

---

## 2. Problem Statement

Modern freelancing marketplaces face two foundational engineering challenges:
1. **Data Integrity & Financial Consistency:** Managing multi-party contractual milestones, proposal assignments, escrow disbursements, and reputation scores requires rigorous relational modeling with ACID transaction guarantees, referential constraints, and event triggers.
2. **The "Semantic Gap" in Talent Discovery:** Keyword filtering frequently fails to match qualified talent due to terminology variance (e.g., "Full-Stack Engineer with React & Node" vs. "Frontend Web Application Developer"). A vector database paradigm is necessary to bridge this semantic gap by projecting project requirements and freelancer capabilities onto a shared vector hyperspace.

---

## 3. Project Objectives

- **Relational Integrity:** Implement a 3NF normalized schema across 15 entities with primary keys, foreign keys (`ON DELETE CASCADE / SET NULL`), unique constraints, and check constraints.
- **Dual Database Paradigm:** Seamlessly combine standard SQL operations with vector similarity queries using PostgreSQL and `pgvector`.
- **Advanced SQL Implementation:** Demonstrate multi-table ACID transactions, compiled database views, stored procedures/functions, database triggers, GIN full-text indexes, and vector distance operators.
- **Semantic Matching System:** Generate normalized 384-dimensional dense embeddings for bids, projects, and freelancer profiles to calculate cosine distance rankings.
- **Multi-Role RBAC:** Provide distinct, secure interfaces for **Clients**, **Freelancers**, and **Platform Administrators**.
- **Modern SaaS UI/UX:** Deliver a polished, responsive dashboard inspired by platforms such as Linear and Upwork.

---

## 4. Key Features by Role

### 💼 Client Capabilities
- **Project Lifecycle Management:** Create, publish, edit, and close project briefs with budget types (Fixed/Hourly), deadlines, and skill tags.
- **Interactive Proposal Comparison:** Review freelancer bids side-by-side with proposed budgets, delivery timelines, ratings, and experience.
- **Transactional Proposal Acceptance:** Accept a proposal in an atomic SQL transaction that simultaneously assigns the freelancer, sets the project to `in-progress`, rejects competing pending bids, creates initial milestones, and notifies the candidate.
- **Milestone & Deliverable Tracking:** Define phased milestones with escrow funding; review freelancer deliverables (repositories, assets).
- **Escrow & Payment Management:** Disburse payments via atomic transactions that update client expenditure and freelancer balance ledgers.
- **Performance Reviews:** Submit star ratings and feedback that trigger automatic database recalculations of freelancer reputation metrics.
- **AI Talent Matching:** Discover matching freelancers ranked by pgvector cosine similarity.

### 🛠️ Freelancer Capabilities
- **Project Discovery:** Browse projects using PostgreSQL GIN full-text search (`tsvector`), category filtering, and budget ranges.
- **AI Semantic Recommendations:** View open projects mathematically ranked by semantic relevance to the freelancer's specific skill set.
- **Proposal Bidding:** Submit detailed technical bids with cover letters, custom budget proposals, and estimated durations.
- **Interactive Task Workspace:** View and update progress across assigned tasks (`todo`, `in-progress`, `review`, `completed`).
- **Earnings & Financial Ledger:** Inspect a chronological payment history queried directly from `view_payment_summaries`.
- **Reputation Showcase:** View client testimonials and aggregate ratings maintained by database triggers.
- **Dynamic Profile Vectorization:** Update technical skills, bio, and hourly rates; changes automatically regenerate the profile's 384-d vector embedding.

### 🛡️ Administrator Capabilities
- **Platform Operations Dashboard:** Monitor platform KPIs computed live from `view_platform_analytics` (total users, active contracts, volume settled, average project budget).
- **User Account Governance:** Inspect all client and freelancer accounts; suspend or reactivate accounts with automated audit logging.
- **Project & Contract Monitor:** System-wide oversight of all contracts and bids.
- **Financial Audit Ledger:** Complete platform transaction history.
- **System Event Audit Trail:** Real-time stream of audit logs captured by database triggers.
- **Interactive DBMS Query Runner:** Live faculty demonstrator console to execute preset and custom queries with millisecond execution timing.

---

## 5. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & UI System** | Tailwind CSS v4, Lucide Icons |
| **Backend Framework** | Node.js v24, Express.js 5, CORS, Dotenv |
| **Relational Database** | PostgreSQL (Normalized 3NF Schema) |
| **Vector Database** | pgvector extension (384-dimensional dense embeddings, `<=>` cosine distance) |
| **Database Drivers** | Native `pg` Pool + Embedded Persistent `@electric-sql/pglite` & `@electric-sql/pglite-pgvector` |
| **Authentication & Security** | JWT (JSON Web Tokens), bcryptjs password hashing, RBAC middleware |
| **Search Engine** | PostgreSQL GIN Full-Text Search (`tsvector`, `ts_rank`, `plainto_tsquery`) |

---

## 6. System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend (Next.js 16 + React 19)"]
        UI_Client["Client Dashboard & Projects"]
        UI_Freelancer["Freelancer Dashboard & Bids"]
        UI_Admin["Admin Ops & DBMS Explorer"]
    end

    subgraph APILayer["Backend Server (Express.js 5)"]
        AuthMid["JWT & RBAC Middleware"]
        Controllers["Controllers (Projects, Proposals, Payments, Analytics)"]
        VectorEngine["Vector Service (384-d Embedding Generator)"]
    end

    subgraph DBLayer["Dual Database Layer (PostgreSQL + pgvector)"]
        subgraph RelationalEngine["Relational DBMS (PostgreSQL)"]
            Tables["15 Normalized Tables"]
            Triggers["Triggers (trg_review_update_rating, trg_projects_search_vector)"]
            Views["Compiled Views (view_project_summaries, view_platform_analytics)"]
            Proc["Stored Procedures (fn_calculate_freelancer_rating)"]
            GIN["GIN Full-Text Search Index"]
        end
        subgraph VectorEngineDB["Vector DB (pgvector)"]
            EmbeddingsCol["Vector(384) Columns"]
            CosineDistance["Cosine Distance Operator (<=>)"]
        end
    end

    UI_Client -->|REST API Requests| AuthMid
    UI_Freelancer -->|REST API Requests| AuthMid
    UI_Admin -->|REST API Requests| AuthMid

    AuthMid --> Controllers
    Controllers --> VectorEngine
    VectorEngine -->|Cosine Similarity Query| CosineDistance
    Controllers -->|ACID Transactions & DML| Tables
    Tables --> Triggers
    Tables --> Views
    Tables --> GIN
```

---

## 7. Installation & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ or v24+ recommended)
- **npm**: v9.0.0 or later

### Step 1: Clone the Repository
```bash
git clone https://github.com/Manju-nayak/Freelancer-Client-Management.git
cd Freelancer-Client-Management
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 8. Environment Configuration

### Backend Configuration
Create a `.env` file inside the `backend/` directory (or copy from `.env.example`):
```bash
# backend/.env
PORT=5000
JWT_SECRET=freelancehub_super_secret_jwt_key_2026_dbms_level_3

# Database Selection:
# Leave blank to use zero-config embedded persistent PostgreSQL + pgvector WASM
# Or supply an external PostgreSQL connection:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/freelancehub
```

### Frontend Configuration
Create a `.env` file inside the `frontend/` directory (or copy from `.env.example`):
```bash
# frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 9. Database Setup & Seeding

The project comes with automated database migrations and rich seed data.

Run the seed command inside `backend/`:
```bash
cd backend
npm run seed
```

This command automatically:
1. Enables the `vector` (pgvector) extension.
2. Creates all 15 normalized relational tables, constraints, foreign keys, and indexes.
3. Installs compiled SQL views (`view_project_summaries`, `view_freelancer_performance`, `view_payment_summaries`, `view_platform_analytics`).
4. Compiles stored procedures and event triggers (`trg_review_update_rating`, `trg_projects_search_vector`, `trg_audit_project_status`).
5. Generates 384-dimensional dense semantic embeddings for projects and freelancer profiles.
6. Populates seed clients, freelancers, admin, projects, milestones, tasks, payments, and reviews.

---

## 10. Running the Application

### 1. Start the Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 2. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

Open **http://localhost:3000** in your web browser.

---

## 11. Pre-Configured Demo Accounts

For immediate evaluation, the following verified demo accounts are pre-seeded:

| Role | Email | Password | Details |
|---|---|---|---|
| **Client** | `client@acmecorp.com` | `client123` | Sarah Jenkins (VP Engineering at Acme Innovations) |
| **Client 2** | `client2@globaltech.com` | `client123` | Michael Chang (Founder at Apex Digital Labs) |
| **Freelancer 1** | `freelancer@dev.com` | `freelancer123` | Alex Rivera (Senior Full-Stack & Cloud Architect) |
| **Freelancer 2** | `priya@designer.com` | `freelancer123` | Priya Sharma (UI/UX & Product Design Specialist) |
| **AI Specialist** | `david@ml.com` | `freelancer123` | David Kim (AI/ML & pgvector Engineer) |
| **Administrator** | `admin@freelancehub.com` | `admin123` | Platform Operations & Database Monitor |

*Tip: The Login page contains one-click buttons to instantly sign in as any of the above personas.*

---

## 12. Automated Test Suite

To verify all 20 DBMS Level 3 functional and database requirements:
```bash
cd backend
npm test
```

The automated test suite verifies:
- PostgreSQL `vector` extension status.
- Relational normalization and foreign key cascades.
- 384-dimensional vector embedding persistence.
- Cosine distance (`<=>`) semantic matching query results.
- PostgreSQL GIN Full-Text Search with `ts_rank`.
- All compiled SQL views.
- Proposal acceptance ACID transactions.
- Milestone disbursement ACID transactions.
- Rating recalculation triggers on `INSERT/UPDATE/DELETE`.
- Relational CHECK constraints preventing invalid data states.

---

## 13. Documentation Index

- [PROJECT_OVERVIEW.md](file:///c:/Users/Sanjay%20V/OneDrive/Desktop/Freelancer-Client-Management/PROJECT_OVERVIEW.md) — Problem statement, requirements, and feature architecture.
- [DATABASE_DESIGN.md](file:///c:/Users/Sanjay%20V/OneDrive/Desktop/Freelancer-Client-Management/DATABASE_DESIGN.md) — 3NF Entity Relationship diagram, relational schema, keys, and constraints.
- [SQL_QUERIES.md](file:///c:/Users/Sanjay%20V/OneDrive/Desktop/Freelancer-Client-Management/SQL_QUERIES.md) — DDL, DML, Transactions, Views, Functions, Triggers, and Analytical queries.
- [VECTOR_DATABASE.md](file:///c:/Users/Sanjay%20V/OneDrive/Desktop/Freelancer-Client-Management/VECTOR_DATABASE.md) — Embedding model, 384 dimensions, pgvector indexing, and cosine search math.
- [API_DOCUMENTATION.md](file:///c:/Users/Sanjay%20V/OneDrive/Desktop/Freelancer-Client-Management/API_DOCUMENTATION.md) — Comprehensive REST API endpoint reference.
- [TESTING_DOCUMENTATION.md](file:///c:/Users/Sanjay%20V/OneDrive/Desktop/Freelancer-Client-Management/TESTING_DOCUMENTATION.md) — Complete test cases, verification results, and execution logs.
