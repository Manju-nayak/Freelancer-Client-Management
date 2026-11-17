# FreelanceHub — Vector Database & Semantic Project Matching Specification

## 1. Vector Database Architecture Overview

**FreelanceHub** incorporates **pgvector** as its second database paradigm. The vector engine transforms unstructured text (skill taxonomies, project requirements, architectural specifications, and professional experience) into high-dimensional geometric representations called **dense embeddings**.

By storing embeddings natively inside PostgreSQL columns, FreelanceHub performs unified relational and vector searches within a single query execution plan.

---

## 2. Technical Specifications

| Parameter | Specification |
|---|---|
| **Vector Database Extension** | `pgvector` (native PostgreSQL extension) |
| **Vector Dimensions** | **384 Dimensions** (`vector(384)`) |
| **Embedding Architecture** | 384-d Dense Semantic Vector Projection (MiniLM-L6 compatible hypersphere) |
| **Storage Columns** | `projects.embedding` & `freelancer_profiles.embedding` |
| **Similarity Metric** | **Cosine Distance** (`<=>` operator in pgvector) |
| **Similarity Score Formula** | $\text{Match Percentage} = \max(0, (1.0 - \text{Cosine Distance})) \times 100$ |
| **Vector Index Type** | IVFFlat / HNSW with `vector_cosine_ops` |
| **API Dependencies** | **Zero Paid External APIs Required** (Runs 100% self-contained locally) |

---

## 3. What Data Is Converted Into Embeddings?

### 3.1 Project Brief Embeddings
To capture both broad domain context and specific technical requirements, projects are synthesized into a composite document before embedding:
$$\text{Project Text} = \text{"Title: } T \text{. Category: } C \text{. Required Skills: } S_1, S_2, \dots \text{. Description: } D\text{"}$$

Example input:
> *"Title: AI-Powered Semantic Document Search Engine. Category: AI & Machine Learning. Required Skills: Python, FastAPI, PostgreSQL, pgvector, Machine Learning, Docker. Description: Design an intelligent semantic search system that indexes multi-format enterprise documentation into vector embeddings using PostgreSQL pgvector. Includes cosine similarity querying and API integration."*

### 3.2 Freelancer Profile Embeddings
Freelancer profiles combine professional title, technical skills, verified years of experience, and biographical summary:
$$\text{Freelancer Text} = \text{"Role: } R \text{. Skills: } S_1, S_2, \dots \text{. Experience: } E \text{ years. Bio: } B\text{"}$$

Example input:
> *"Role: AI/ML & Vector Database Engineer. Skills: Python, FastAPI, Machine Learning, PostgreSQL, pgvector, Docker. Experience: 6 years. Bio: AI/ML Engineer specializing in vector search, semantic embeddings, Python FastAPI, and PostgreSQL pgvector."*

---

## 4. Embedding Generation Engine

The embedding pipeline in `backend/services/vectorService.js`:
1. **Tokenization & Normalization:** Cleans input string, strips punctuation, and extracts unigrams and bigrams.
2. **Domain Cluster Weighting:** Maps technical keywords to specific coordinate bands across 384 dimensions:
   - **Dimensions 0–63:** Frontend ecosystem (React, Next.js, Vue, TypeScript, Tailwind)
   - **Dimensions 64–127:** Backend & APIs (Node.js, Express, Python, FastAPI, Go, GraphQL)
   - **Dimensions 128–191:** Database & Storage (PostgreSQL, pgvector, SQL, Redis, Indexing)
   - **Dimensions 192–255:** DevOps & Cloud (Docker, Kubernetes, AWS, CI/CD)
   - **Dimensions 256–319:** AI, ML & Math (Embeddings, NLP, PyTorch, LLMs)
   - **Dimensions 320–383:** Mobile & Architecture (Flutter, iOS, Architecture, Lead)
3. **Feature Hashing & Lexical Generalization:** Generalizes unseen vocabulary across dimensions using polynomial feature hashing.
4. **$L_2$ Normalization:** Normalizes the resulting 384-d vector onto the unit hypersphere:
   $$\vec{u} = \frac{\vec{v}}{\|\vec{v}\|_2} = \frac{\vec{v}}{\sqrt{\sum_{i=1}^{384} v_i^2}}$$

This mathematical property guarantees that **Cosine Distance** and **Euclidean Distance** are monotonically proportional, allowing high-performance cosine distance index scans.

---

## 5. Similarity Metric: Cosine Distance

Given two 384-dimensional unit vectors $\vec{A}$ (project) and $\vec{B}$ (freelancer):

$$\text{Cosine Similarity} = \cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \sum_{i=1}^{384} A_i B_i$$

In PostgreSQL with `pgvector`, the `<=>` operator computes the **Cosine Distance**:
$$\text{Cosine Distance} = 1 - \cos(\theta) = 1 - (\vec{A} \cdot \vec{B})$$

- When vectors are identical: $\text{Distance} = 0.0 \implies \text{Match} = 100.0\%$
- When vectors are orthogonal: $\text{Distance} = 1.0 \implies \text{Match} = 0.0\%$

---

## 6. How Vector Similarity Search Works in SQL

### 6.1 Bidirectional Search 1: Freelancer Project Recommendations
When a freelancer navigates to their dashboard or the **AI Semantic Matches** tab, the following SQL query executes:

```sql
SELECT 
    p.id,
    p.title,
    p.description,
    p.category,
    p.budget,
    p.budget_type,
    p.deadline,
    p.experience_level,
    p.created_at,
    u.name AS client_name,
    ROUND((GREATEST(0.0, (1.0 - (p.embedding <=> fp.embedding))) * 100)::numeric, 1) AS match_score
FROM projects p
JOIN users u ON p.client_id = u.id
CROSS JOIN freelancer_profiles fp
WHERE fp.user_id = $1 -- Target Freelancer ID
  AND p.status = 'open'
  AND p.embedding IS NOT NULL
  AND fp.embedding IS NOT NULL
  AND p.id NOT IN (
    SELECT project_id FROM proposals WHERE freelancer_id = $1
  )
ORDER BY p.embedding <=> fp.embedding ASC
LIMIT $2;
```

**Key Execution Properties:**
- Uses the `<=>` operator to order projects by semantic proximity.
- Filters out projects the freelancer has already submitted bids to.
- Automatically excludes closed or completed contracts.

---

### 6.2 Bidirectional Search 2: Client Talent Recommendations
When a client inspects a project detail page under the **AI Vector Matches** tab, the platform semantically recommends the best freelancers:

```sql
SELECT 
    u.id AS freelancer_id,
    u.name,
    u.email,
    fp.title,
    fp.hourly_rate,
    fp.experience_years,
    fp.rating_avg,
    fp.rating_count,
    ROUND((GREATEST(0.0, (1.0 - (p.embedding <=> fp.embedding))) * 100)::numeric, 1) AS match_score
FROM freelancer_profiles fp
JOIN users u ON fp.user_id = u.id
CROSS JOIN projects p
WHERE p.id = $1 -- Target Project ID
  AND u.is_active = TRUE
  AND p.embedding IS NOT NULL
  AND fp.embedding IS NOT NULL
  AND u.id != p.client_id
ORDER BY p.embedding <=> fp.embedding ASC
LIMIT $2;
```

---

## 7. Dynamic Vector Lifecycle

1. **On User Registration / Profile Update:**
   When a freelancer edits their skills or bio in `/freelancer/profile`, the backend automatically calls `generateFreelancerEmbedding(...)` and updates `freelancer_profiles.embedding`.
2. **On Project Creation / Edit:**
   When a client posts a project brief, `generateProjectEmbedding(...)` executes and writes the new 384-d vector to `projects.embedding`.
3. **No Batch Delays:**
   Recommendations update instantly upon record insertion without requiring offline batch embedding re-indexing.
