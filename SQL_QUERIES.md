# FreelanceHub — Comprehensive SQL Queries & Advanced DBMS Concepts

This document provides verified SQL statements demonstrating **DDL, DML, Advanced Relational Queries, ACID Transactions, Views, Stored Functions, Database Triggers, Full-Text Search, and pgvector operations**.

---

## 1. Data Definition Language (DDL)

### 1.1 Enabling pgvector Extension
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.2 Table Creation with Integrity Constraints
```sql
-- Core Projects Table with CHECK Constraints, Foreign Keys, tsvector, and vector(384)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_freelancer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    budget NUMERIC(12, 2) NOT NULL CHECK (budget > 0),
    budget_type VARCHAR(20) DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly')),
    deadline DATE NOT NULL,
    experience_level VARCHAR(20) DEFAULT 'intermediate' CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'completed', 'cancelled')),
    search_vector tsvector,
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3 Table Alteration & Index Creation
```sql
-- GIN Index for High-Speed Full-Text Search
CREATE INDEX idx_projects_search_vector ON projects USING gin(search_vector);

-- B-Tree Composite Index for Unique Proposal Checking
CREATE INDEX idx_proposals_project_freelancer ON proposals(project_id, freelancer_id);
```

---

## 2. Advanced SQL Concepts

### 2.1 Multi-Table ACID Transactions

#### Transaction 1: Atomic Proposal Acceptance and Freelancer Assignment
```sql
BEGIN;

-- 1. Accept the chosen proposal
UPDATE proposals 
SET status = 'accepted' 
WHERE id = 1 AND project_id = 2;

-- 2. Automatically reject all other competing proposals for this project
UPDATE proposals 
SET status = 'rejected' 
WHERE project_id = 2 AND id != 1 AND status = 'pending';

-- 3. Transition project status to 'in-progress' and bind freelancer foreign key
UPDATE projects 
SET status = 'in-progress', 
    assigned_freelancer_id = (SELECT freelancer_id FROM proposals WHERE id = 1)
WHERE id = 2;

-- 4. Automatically create kick-off milestone
INSERT INTO milestones (project_id, title, description, amount, due_date, status)
VALUES (2, 'Initial Delivery Phase', 'Fulfill agreed project deliverables', 4500.00, CURRENT_DATE + INTERVAL '30 days', 'in-progress');

-- 5. Record immutable audit log
INSERT INTO audit_logs (entity_type, entity_id, action, details)
VALUES ('proposal', 1, 'PROPOSAL_ACCEPTED_AND_ASSIGNED', 'Assigned freelancer to project #2');

COMMIT;
```

#### Transaction 2: Milestone Payment Disbursement with Dual Ledger Updates
```sql
BEGIN;

-- 1. Insert payment record with unique transaction reference
INSERT INTO payments (project_id, client_id, freelancer_id, milestone_id, amount, payment_method, transaction_reference, status)
VALUES (1, 2, 4, 1, 1500.00, 'Escrow', 'TXN-ACM-202611-001', 'completed');

-- 2. Update client cumulative expenditure
UPDATE client_profiles 
SET total_spent = total_spent + 1500.00 
WHERE user_id = 2;

-- 3. Update freelancer cumulative earnings
UPDATE freelancer_profiles 
SET total_earnings = total_earnings + 1500.00 
WHERE user_id = 4;

-- 4. Mark associated milestone as paid
UPDATE milestones 
SET status = 'paid' 
WHERE id = 1;

COMMIT;
```

---

### 2.2 Compiled Database Views

#### View 1: Project Summaries View (Multi-Table Aggregation)
```sql
CREATE OR REPLACE VIEW view_project_summaries AS
SELECT 
    p.id AS project_id,
    p.title,
    p.category,
    p.budget,
    p.budget_type,
    p.deadline,
    p.status,
    p.created_at,
    u_client.id AS client_id,
    u_client.name AS client_name,
    u_client.email AS client_email,
    u_free.id AS freelancer_id,
    u_free.name AS freelancer_name,
    COALESCE(prop_count.total_proposals, 0) AS total_proposals,
    COALESCE(task_stat.total_tasks, 0) AS total_tasks,
    COALESCE(task_stat.completed_tasks, 0) AS completed_tasks,
    CASE 
        WHEN COALESCE(task_stat.total_tasks, 0) > 0 
        THEN ROUND((COALESCE(task_stat.completed_tasks, 0)::numeric / task_stat.total_tasks::numeric) * 100, 1)
        ELSE 0.0 
    END AS task_progress_pct,
    COALESCE(pay_stat.total_paid, 0.00) AS total_paid
FROM projects p
JOIN users u_client ON p.client_id = u_client.id
LEFT JOIN users u_free ON p.assigned_freelancer_id = u_free.id
LEFT JOIN (
    SELECT project_id, COUNT(*) AS total_proposals 
    FROM proposals 
    GROUP BY project_id
) prop_count ON p.id = prop_count.project_id
LEFT JOIN (
    SELECT 
        project_id, 
        COUNT(*) AS total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_tasks
    FROM tasks 
    GROUP BY project_id
) task_stat ON p.id = task_stat.project_id
LEFT JOIN (
    SELECT project_id, SUM(amount) AS total_paid 
    FROM payments 
    WHERE status = 'completed' 
    GROUP BY project_id
) pay_stat ON p.id = pay_stat.project_id;
```

#### View 2: Freelancer Performance Analytics View
```sql
CREATE OR REPLACE VIEW view_freelancer_performance AS
SELECT 
    u.id AS freelancer_id,
    u.name,
    u.email,
    fp.title,
    fp.hourly_rate,
    fp.experience_years,
    fp.rating_avg,
    fp.rating_count,
    COALESCE(proj_stat.active_projects, 0) AS active_projects,
    COALESCE(proj_stat.completed_projects, 0) AS completed_projects,
    COALESCE(pay_stat.total_earnings, 0.00) AS total_earnings,
    COALESCE(prop_stat.submitted_proposals, 0) AS submitted_proposals,
    COALESCE(prop_stat.accepted_proposals, 0) AS accepted_proposals,
    CASE 
        WHEN COALESCE(proj_stat.total_assigned, 0) > 0 
        THEN ROUND((COALESCE(proj_stat.completed_projects, 0)::numeric / proj_stat.total_assigned::numeric) * 100, 1)
        ELSE 100.0 
    END AS completion_rate_pct
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
LEFT JOIN (
    SELECT 
        assigned_freelancer_id,
        COUNT(*) AS total_assigned,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) AS active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_projects
    FROM projects
    WHERE assigned_freelancer_id IS NOT NULL
    GROUP BY assigned_freelancer_id
) proj_stat ON u.id = proj_stat.assigned_freelancer_id
LEFT JOIN (
    SELECT freelancer_id, SUM(amount) AS total_earnings
    FROM payments
    WHERE status = 'completed'
    GROUP BY freelancer_id
) pay_stat ON u.id = pay_stat.freelancer_id
LEFT JOIN (
    SELECT 
        freelancer_id,
        COUNT(*) AS submitted_proposals,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS accepted_proposals
    FROM proposals
    GROUP BY freelancer_id
) prop_stat ON u.id = prop_stat.freelancer_id;
```

---

### 2.3 Stored Procedures & Database Functions (PL/pgSQL)

#### Function: Rating Recalculator
```sql
CREATE OR REPLACE FUNCTION fn_calculate_freelancer_rating(p_freelancer_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_avg NUMERIC(3, 2);
    v_count INTEGER;
BEGIN
    SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 2), 5.00),
        COUNT(*)
    INTO v_avg, v_count
    FROM reviews
    WHERE reviewee_id = p_freelancer_id;

    UPDATE freelancer_profiles
    SET rating_avg = v_avg,
        rating_count = v_count
    WHERE user_id = p_freelancer_id;
END;
$$ LANGUAGE plpgsql;
```

---

### 2.4 Database Triggers

#### Trigger 1: Automatic Rating Recalculation on Review Change
```sql
CREATE OR REPLACE FUNCTION fn_trigger_after_review()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM fn_calculate_freelancer_rating(OLD.reviewee_id);
        RETURN OLD;
    ELSE
        PERFORM fn_calculate_freelancer_rating(NEW.reviewee_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_update_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION fn_trigger_after_review();
```

#### Trigger 2: Automatic Maintenance of Full-Text Search Vector
```sql
CREATE OR REPLACE FUNCTION fn_trigger_sync_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_search_vector
    BEFORE INSERT OR UPDATE OF title, description, category ON projects
    FOR EACH ROW
    EXECUTE FUNCTION fn_trigger_sync_search_vector();
```

---

### 2.5 PostgreSQL GIN Full-Text Search Queries
```sql
-- Full-Text search ranking projects by relevance to "analytics and financial"
SELECT 
    id, 
    title, 
    category, 
    budget,
    ts_rank(search_vector, plainto_tsquery('english', 'analytics financial')) AS relevance_score
FROM projects
WHERE search_vector @@ plainto_tsquery('english', 'analytics financial')
ORDER BY relevance_score DESC;
```

---

### 2.6 pgvector Semantic Vector Similarity Queries (<=>)

#### Recommend Open Projects to Freelancer
```sql
SELECT 
    p.id AS project_id,
    p.title,
    p.category,
    p.budget,
    u.name AS client_name,
    ROUND((GREATEST(0.0, (1.0 - (p.embedding <=> fp.embedding))) * 100)::numeric, 1) AS match_score_pct,
    ROUND((p.embedding <=> fp.embedding)::numeric, 4) AS cosine_distance
FROM projects p
JOIN users u ON p.client_id = u.id
CROSS JOIN freelancer_profiles fp
WHERE fp.user_id = 6 -- David Kim (AI specialist)
  AND p.status = 'open'
  AND p.embedding IS NOT NULL
  AND fp.embedding IS NOT NULL
  AND p.id NOT IN (SELECT project_id FROM proposals WHERE freelancer_id = 6)
ORDER BY p.embedding <=> fp.embedding ASC
LIMIT 5;
```

#### Recommend Best Matching Freelancers to Client for Project
```sql
SELECT 
    u.id AS freelancer_id,
    u.name,
    fp.title,
    fp.hourly_rate,
    fp.rating_avg,
    ROUND((GREATEST(0.0, (1.0 - (p.embedding <=> fp.embedding))) * 100)::numeric, 1) AS match_score_pct
FROM freelancer_profiles fp
JOIN users u ON fp.user_id = u.id
CROSS JOIN projects p
WHERE p.id = 2 -- AI Document Search project
  AND u.is_active = TRUE
  AND p.embedding IS NOT NULL
  AND fp.embedding IS NOT NULL
ORDER BY p.embedding <=> fp.embedding ASC
LIMIT 5;
```

---

## 3. Real-World Analytical Queries (Phase 5 Requirements)

### 3.1 Find Freelancers with the Highest Ratings and Experience
```sql
SELECT 
    u.name,
    fp.title,
    fp.rating_avg,
    fp.rating_count,
    fp.experience_years,
    fp.total_earnings
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
WHERE fp.rating_count > 0
ORDER BY fp.rating_avg DESC, fp.rating_count DESC, fp.experience_years DESC
LIMIT 5;
```

### 3.2 Find Projects with the Most Proposals (HAVING & Aggregates)
```sql
SELECT 
    p.id,
    p.title,
    p.category,
    p.budget,
    COUNT(pr.id) AS proposal_count,
    ROUND(AVG(pr.proposed_budget)::numeric, 2) AS avg_bid_amount
FROM projects p
JOIN proposals pr ON p.id = pr.project_id
GROUP BY p.id, p.title, p.category, p.budget
HAVING COUNT(pr.id) >= 1
ORDER BY proposal_count DESC;
```

### 3.3 Client Spending Comparison vs Platform Average (Nested Subqueries)
```sql
SELECT 
    u.id,
    u.name,
    cp.company_name,
    cp.total_spent,
    (SELECT ROUND(AVG(total_spent)::numeric, 2) FROM client_profiles) AS platform_avg_spending,
    CASE 
        WHEN cp.total_spent > (SELECT AVG(total_spent) FROM client_profiles) THEN 'High-Value Client'
        ELSE 'Standard Client'
    END AS client_tier
FROM users u
JOIN client_profiles cp ON u.id = cp.user_id
ORDER BY cp.total_spent DESC;
```

### 3.4 Identify Overdue or Imminent Projects
```sql
SELECT 
    p.id,
    p.title,
    p.status,
    p.deadline,
    p.deadline - CURRENT_DATE AS days_remaining,
    u.name AS client_name
FROM projects p
JOIN users u ON p.client_id = u.id
WHERE p.status IN ('open', 'in-progress')
ORDER BY p.deadline ASC;
```

### 3.5 Generate Monthly Transaction Summaries
```sql
SELECT 
    TO_CHAR(created_at, 'Mon YYYY') AS transaction_month,
    COUNT(*) AS total_disbursements,
    SUM(amount) AS total_settled_amount,
    ROUND(AVG(amount)::numeric, 2) AS avg_transaction_size
FROM payments
WHERE status = 'completed'
GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
ORDER BY DATE_TRUNC('month', created_at) DESC;
```
