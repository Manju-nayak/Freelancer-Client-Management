-- ==========================================================
-- Freelancer-Client Project Management System
-- Comprehensive DBMS Level 3 PostgreSQL + pgvector Schema
-- ==========================================================

-- 1. Enable pgvector Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Clean Drop for Idempotent Initialization
DROP VIEW IF EXISTS view_platform_analytics CASCADE;
DROP VIEW IF EXISTS view_client_spending_stats CASCADE;
DROP VIEW IF EXISTS view_payment_summaries CASCADE;
DROP VIEW IF EXISTS view_freelancer_performance CASCADE;
DROP VIEW IF EXISTS view_project_summaries CASCADE;

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS project_deliverables CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS project_skills CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS freelancer_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS freelancer_profiles CASCADE;
DROP TABLE IF EXISTS client_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================================
-- Core Entities
-- ==========================================================

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'freelancer', 'admin')),
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CLIENT PROFILES TABLE
CREATE TABLE client_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) DEFAULT '',
    industry VARCHAR(100) DEFAULT '',
    website VARCHAR(255) DEFAULT '',
    total_spent NUMERIC(12, 2) DEFAULT 0.00 CHECK (total_spent >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FREELANCER PROFILES TABLE (with pgvector embedding column)
CREATE TABLE freelancer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) DEFAULT 'Freelance Professional',
    hourly_rate NUMERIC(10, 2) DEFAULT 0.00 CHECK (hourly_rate >= 0),
    experience_years INTEGER DEFAULT 1 CHECK (experience_years >= 0),
    portfolio_url TEXT DEFAULT '',
    total_earnings NUMERIC(12, 2) DEFAULT 0.00 CHECK (total_earnings >= 0),
    rating_avg NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating_avg >= 0 AND rating_avg <= 5.00),
    rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
    embedding vector(384), -- Semantic vector representation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SKILLS MASTER TABLE
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'General'
);

-- FREELANCER SKILLS (Many-to-Many)
CREATE TABLE freelancer_skills (
    freelancer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    years_of_experience INTEGER DEFAULT 1 CHECK (years_of_experience >= 0),
    PRIMARY KEY (freelancer_id, skill_id)
);

-- PROJECTS TABLE (with Full-Text Search tsvector & pgvector embedding)
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
    search_vector tsvector, -- PostgreSQL Full-Text Search Vector
    embedding vector(384),  -- Semantic vector representation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PROJECT SKILLS (Many-to-Many)
CREATE TABLE project_skills (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, skill_id)
);

-- PROPOSALS TABLE
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    proposed_budget NUMERIC(12, 2) NOT NULL CHECK (proposed_budget > 0),
    estimated_duration VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, freelancer_id)
);

-- MILESTONES TABLE
CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'submitted', 'approved', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TASKS TABLE
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    milestone_id INTEGER REFERENCES milestones(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'completed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PROJECT DELIVERABLES TABLE
CREATE TABLE project_deliverables (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    file_url TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PAYMENTS TABLE
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    freelancer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_id INTEGER REFERENCES milestones(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Credit Card', 'Bank Transfer', 'Escrow')),
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- REVIEWS TABLE
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, reviewer_id, reviewee_id)
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- INDEXING (Performance & Optimization)
-- ==========================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_assigned ON projects(assigned_freelancer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_proposals_project_freelancer ON proposals(project_id, freelancer_id);
CREATE INDEX idx_proposals_freelancer ON proposals(freelancer_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_freelancer ON payments(freelancer_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Full-Text Search GIN Index
CREATE INDEX idx_projects_search_vector ON projects USING gin(search_vector);

-- ==========================================================
-- ADVANCED SQL CONCEPTS: VIEWS
-- ==========================================================

-- 1. Project Summaries View (Aggregates proposals, tasks, payments)
CREATE VIEW view_project_summaries AS
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

-- 2. Freelancer Performance View
CREATE VIEW view_freelancer_performance AS
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

-- 3. Payment Summaries View
CREATE VIEW view_payment_summaries AS
SELECT 
    pay.id AS payment_id,
    pay.transaction_reference,
    pay.amount,
    pay.payment_method,
    pay.status,
    pay.created_at,
    p.id AS project_id,
    p.title AS project_title,
    u_client.id AS client_id,
    u_client.name AS client_name,
    u_free.id AS freelancer_id,
    u_free.name AS freelancer_name,
    m.title AS milestone_title
FROM payments pay
JOIN projects p ON pay.project_id = p.id
JOIN users u_client ON pay.client_id = u_client.id
JOIN users u_free ON pay.freelancer_id = u_free.id
LEFT JOIN milestones m ON pay.milestone_id = m.id;

-- 4. Client Spending Stats View
CREATE VIEW view_client_spending_stats AS
SELECT 
    u.id AS client_id,
    u.name AS client_name,
    u.email AS client_email,
    cp.company_name,
    COALESCE(proj.total_projects, 0) AS total_projects,
    COALESCE(proj.open_projects, 0) AS open_projects,
    COALESCE(proj.active_projects, 0) AS active_projects,
    COALESCE(proj.completed_projects, 0) AS completed_projects,
    COALESCE(spend.total_spent, 0.00) AS total_spent
FROM users u
JOIN client_profiles cp ON u.id = cp.user_id
LEFT JOIN (
    SELECT 
        client_id,
        COUNT(*) AS total_projects,
        COUNT(CASE WHEN status = 'open' THEN 1 END) AS open_projects,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) AS active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_projects
    FROM projects
    GROUP BY client_id
) proj ON u.id = proj.client_id
LEFT JOIN (
    SELECT client_id, SUM(amount) AS total_spent
    FROM payments
    WHERE status = 'completed'
    GROUP BY client_id
) spend ON u.id = spend.client_id;

-- 5. Platform Wide Analytics View (Admin)
CREATE VIEW view_platform_analytics AS
SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'client') AS total_clients,
    (SELECT COUNT(*) FROM users WHERE role = 'freelancer') AS total_freelancers,
    (SELECT COUNT(*) FROM projects) AS total_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'open') AS open_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'in-progress') AS active_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'completed') AS completed_projects,
    (SELECT COUNT(*) FROM proposals) AS total_proposals,
    (SELECT COUNT(*) FROM payments WHERE status = 'completed') AS total_transactions,
    (SELECT COALESCE(SUM(amount), 0.00) FROM payments WHERE status = 'completed') AS total_volume_amount,
    (SELECT COALESCE(AVG(budget), 0.00) FROM projects) AS avg_project_budget;

-- ==========================================================
-- ADVANCED SQL CONCEPTS: FUNCTIONS & STORED PROCEDURES
-- ==========================================================

-- Function 1: Recalculate and update freelancer rating
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

-- Function 2: Recalculate and update client total spent
CREATE OR REPLACE FUNCTION fn_update_client_spending(p_client_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_spent NUMERIC(12, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0.00)
    INTO v_spent
    FROM payments
    WHERE client_id = p_client_id AND status = 'completed';

    UPDATE client_profiles
    SET total_spent = v_spent
    WHERE user_id = p_client_id;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Recalculate and update freelancer total earnings
CREATE OR REPLACE FUNCTION fn_update_freelancer_earnings(p_freelancer_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_earnings NUMERIC(12, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0.00)
    INTO v_earnings
    FROM payments
    WHERE freelancer_id = p_freelancer_id AND status = 'completed';

    UPDATE freelancer_profiles
    SET total_earnings = v_earnings
    WHERE user_id = p_freelancer_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================
-- ADVANCED SQL CONCEPTS: TRIGGERS
-- ==========================================================

-- Trigger Function 1: Maintain updated_at timestamp
CREATE OR REPLACE FUNCTION fn_trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION fn_trigger_update_timestamp();

CREATE TRIGGER trg_projects_timestamp
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION fn_trigger_update_timestamp();

-- Trigger Function 2: Automatically maintain Full-Text Search tsvector on projects
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

-- Trigger Function 3: Automatically recalculate rating on review changes (INSERT, UPDATE, DELETE)
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

-- Trigger Function 4: Audit status changes on projects
CREATE OR REPLACE FUNCTION fn_trigger_audit_project_status()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO audit_logs (entity_type, entity_id, action, details)
        VALUES (
            'project', 
            NEW.id, 
            'STATUS_CHANGE', 
            'Status changed from ' || OLD.status || ' to ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_project_status
    AFTER UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION fn_trigger_audit_project_status();
