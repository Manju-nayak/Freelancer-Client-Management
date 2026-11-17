/**
 * Database Migration and Seed Script
 * 
 * Sets up PostgreSQL tables, constraints, indexes, views, triggers,
 * and seeds rich realistic data for Client, Freelancer, Admin, Projects,
 * Proposals, Milestones, Tasks, Payments, Reviews, and pgvector embeddings.
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { getDB, query, exec } = require("../config/db");
const {
  generateProjectEmbedding,
  generateFreelancerEmbedding
} = require("../services/vectorService");

async function seed() {
  console.log("Starting PostgreSQL schema migration & seeding...");

  await getDB();

  // 1. Run schema DDL
  const schemaPath = path.resolve(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  console.log("Applying schema DDL, views, triggers, and indexes...");
  await exec(schemaSql);
  console.log("Schema applied successfully!");

  // 2. Hash default passwords
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordClient = await bcrypt.hash("client123", 10);
  const passwordFreelancer = await bcrypt.hash("freelancer123", 10);

  // 3. Insert Users
  console.log("Seeding core users (Admin, Clients, Freelancers)...");
  const usersToInsert = [
    {
      name: "System Administrator",
      email: "admin@freelancehub.com",
      password: passwordAdmin,
      role: "admin",
      bio: "Platform administrator and system monitor."
    },
    {
      name: "Sarah Jenkins",
      email: "client@acmecorp.com",
      password: passwordClient,
      role: "client",
      bio: "VP of Product Engineering at Acme Innovations. Looking for senior cloud & full-stack talent."
    },
    {
      name: "Michael Chang",
      email: "client2@globaltech.com",
      password: passwordClient,
      role: "client",
      bio: "Founder at Apex Digital Labs. Building high-growth SaaS and e-commerce platforms."
    },
    {
      name: "Alex Rivera",
      email: "freelancer@dev.com",
      password: passwordFreelancer,
      role: "freelancer",
      bio: "Senior Full-Stack & Cloud Architect with 7+ years building enterprise web apps with Next.js, Node.js, and PostgreSQL."
    },
    {
      name: "Priya Sharma",
      email: "priya@designer.com",
      password: passwordFreelancer,
      role: "freelancer",
      bio: "Lead UI/UX & Design Systems Engineer. Specialized in clean SaaS dashboards, Tailwind CSS, and user experience."
    },
    {
      name: "David Kim",
      email: "david@ml.com",
      password: passwordFreelancer,
      role: "freelancer",
      bio: "AI/ML Engineer specializing in vector search, semantic embeddings, Python FastAPI, and PostgreSQL pgvector."
    }
  ];

  const userIds = {};
  for (const u of usersToInsert) {
    const res = await query(
      `INSERT INTO users (name, email, password_hash, role, bio)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, role, email;`,
      [u.name, u.email, u.password, u.role, u.bio]
    );
    userIds[u.email] = res.rows[0].id;
  }

  // 4. Insert Client Profiles
  console.log("Seeding client profiles...");
  await query(
    `INSERT INTO client_profiles (user_id, company_name, industry, website, total_spent)
     VALUES 
     ($1, 'Acme Innovations', 'FinTech & Cloud', 'https://acme.innovations.com', 1500.00),
     ($2, 'Apex Digital Labs', 'E-Commerce & Mobile', 'https://apexdigital.io', 2200.00);`,
    [userIds["client@acmecorp.com"], userIds["client2@globaltech.com"]]
  );

  // 5. Insert Freelancer Profiles with pgvector embeddings
  console.log("Generating semantic embeddings and seeding freelancer profiles...");
  const freelancerProfiles = [
    {
      email: "freelancer@dev.com",
      title: "Senior Full-Stack & Cloud Architect",
      hourly_rate: 65.00,
      experience_years: 7,
      portfolio_url: "https://alexrivera.dev",
      skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "Tailwind CSS"],
      bio: "Senior Full-Stack & Cloud Architect with 7+ years building enterprise web apps with Next.js, Node.js, and PostgreSQL."
    },
    {
      email: "priya@designer.com",
      title: "UI/UX & Product Design Specialist",
      hourly_rate: 55.00,
      experience_years: 5,
      portfolio_url: "https://priyasharma.design",
      skills: ["UI/UX Design", "Tailwind CSS", "React", "Next.js", "Design Systems"],
      bio: "Lead UI/UX & Design Systems Engineer. Specialized in clean SaaS dashboards, Tailwind CSS, and user experience."
    },
    {
      email: "david@ml.com",
      title: "AI/ML & Vector Database Engineer",
      hourly_rate: 80.00,
      experience_years: 6,
      portfolio_url: "https://davidkim.ai",
      skills: ["Python", "FastAPI", "Machine Learning", "PostgreSQL", "pgvector", "Docker"],
      bio: "AI/ML Engineer specializing in vector search, semantic embeddings, Python FastAPI, and PostgreSQL pgvector."
    }
  ];

  for (const fp of freelancerProfiles) {
    const embedding = generateFreelancerEmbedding(fp);
    const initialRatingCount = (fp.email === "freelancer@dev.com" || fp.email === "priya@designer.com") ? 1 : 0;
    await query(
      `INSERT INTO freelancer_profiles 
       (user_id, title, hourly_rate, experience_years, portfolio_url, embedding, rating_avg, rating_count, total_earnings)
       VALUES ($1, $2, $3, $4, $5, $6::vector, 5.00, $7, $8);`,
      [
        userIds[fp.email],
        fp.title,
        fp.hourly_rate,
        fp.experience_years,
        fp.portfolio_url,
        embedding,
        initialRatingCount,
        fp.email === "freelancer@dev.com" ? 1500.00 : fp.email === "priya@designer.com" ? 2200.00 : 0.00
      ]
    );
  }

  // 6. Insert Master Skills
  console.log("Seeding master skills list...");
  const skillsList = [
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "TypeScript", category: "Languages" },
    { name: "Node.js", category: "Backend" },
    { name: "Express", category: "Backend" },
    { name: "PostgreSQL", category: "Database" },
    { name: "pgvector", category: "Database" },
    { name: "Python", category: "Languages" },
    { name: "FastAPI", category: "Backend" },
    { name: "Tailwind CSS", category: "Frontend" },
    { name: "Docker", category: "DevOps" },
    { name: "AWS", category: "Cloud" },
    { name: "Machine Learning", category: "AI/ML" },
    { name: "UI/UX Design", category: "Design" },
    { name: "Flutter", category: "Mobile" },
    { name: "GraphQL", category: "Backend" },
    { name: "Redis", category: "Database" }
  ];

  const skillIds = {};
  for (const s of skillsList) {
    const res = await query(
      `INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING id, name;`,
      [s.name, s.category]
    );
    skillIds[s.name] = res.rows[0].id;
  }

  // Associate freelancer skills
  for (const fp of freelancerProfiles) {
    const fId = userIds[fp.email];
    for (const skillName of fp.skills) {
      if (skillIds[skillName]) {
        await query(
          `INSERT INTO freelancer_skills (freelancer_id, skill_id, years_of_experience)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`,
          [fId, skillIds[skillName], fp.experience_years]
        );
      }
    }
  }

  // 7. Insert Projects with pgvector embeddings
  console.log("Generating semantic embeddings and seeding projects...");
  const projectsData = [
    {
      title: "Enterprise Financial Analytics Dashboard",
      description: "Build a high-performance analytics web dashboard with real-time financial charts, user authorization, and PostgreSQL reporting views. Must follow Linear/Upwork SaaS design standards.",
      category: "Full-Stack Development",
      budget: 4500.00,
      budget_type: "fixed",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      experience_level: "expert",
      status: "in-progress",
      client_email: "client@acmecorp.com",
      assigned_email: "freelancer@dev.com",
      skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"]
    },
    {
      title: "AI-Powered Semantic Document Search Engine",
      description: "Design an intelligent semantic search system that indexes multi-format enterprise documentation into vector embeddings using PostgreSQL pgvector. Includes cosine similarity querying and API integration.",
      category: "AI & Machine Learning",
      budget: 6000.00,
      budget_type: "fixed",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      experience_level: "expert",
      status: "open",
      client_email: "client@acmecorp.com",
      assigned_email: null,
      skills: ["Python", "FastAPI", "PostgreSQL", "pgvector", "Machine Learning", "Docker"]
    },
    {
      title: "Modern SaaS Design System & Micro-Interactions",
      description: "Design a comprehensive, accessible design system with 40+ responsive UI components, dark and light mode themes, and smooth micro-animations for our digital platform.",
      category: "UI/UX Design",
      budget: 2200.00,
      budget_type: "fixed",
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      experience_level: "intermediate",
      status: "completed",
      client_email: "client2@globaltech.com",
      assigned_email: "priya@designer.com",
      skills: ["UI/UX Design", "Tailwind CSS", "React"]
    },
    {
      title: "Cross-Platform Logistics & Fleet Mobile App",
      description: "Develop a cross-platform mobile application for fleet drivers and logistics coordinators with live GPS telemetry, offline queueing, and push notifications.",
      category: "Mobile App Development",
      budget: 3800.00,
      budget_type: "fixed",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      experience_level: "intermediate",
      status: "open",
      client_email: "client2@globaltech.com",
      assigned_email: null,
      skills: ["Flutter", "Node.js", "PostgreSQL", "TypeScript"]
    },
    {
      title: "Automated Data Pipeline & Warehouse ETL",
      description: "Construct scalable data ingestion pipelines that stream transactional events into PostgreSQL with automated aggregations and audit logging.",
      category: "Database Engineering",
      budget: 5200.00,
      budget_type: "fixed",
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      experience_level: "expert",
      status: "open",
      client_email: "client@acmecorp.com",
      assigned_email: null,
      skills: ["PostgreSQL", "Python", "Docker", "AWS"]
    }
  ];

  const projectIds = [];
  for (const p of projectsData) {
    const embedding = generateProjectEmbedding(p);
    const clientId = userIds[p.client_email];
    const assignedId = p.assigned_email ? userIds[p.assigned_email] : null;

    const res = await query(
      `INSERT INTO projects 
       (client_id, assigned_freelancer_id, title, description, category, budget, budget_type, deadline, experience_level, status, embedding)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::vector)
       RETURNING id, title;`,
      [
        clientId,
        assignedId,
        p.title,
        p.description,
        p.category,
        p.budget,
        p.budget_type,
        p.deadline,
        p.experience_level,
        p.status,
        embedding
      ]
    );

    const projectId = res.rows[0].id;
    projectIds.push({ id: projectId, title: p.title, status: p.status });

    // Link skills
    for (const skillName of p.skills) {
      if (skillIds[skillName]) {
        await query(
          `INSERT INTO project_skills (project_id, skill_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
          [projectId, skillIds[skillName]]
        );
      }
    }
  }

  // 8. Seed Proposals
  console.log("Seeding proposals...");
  const proj1Id = projectIds[0].id;
  const proj2Id = projectIds[1].id;
  const proj3Id = projectIds[2].id;

  // Accepted proposal for Project 1
  await query(
    `INSERT INTO proposals (project_id, freelancer_id, cover_letter, proposed_budget, estimated_duration, status)
     VALUES 
     ($1, $2, 'I have architected multiple financial platforms using Next.js and PostgreSQL. I can deliver a modular, secure, high-speed solution within 4 weeks.', 4500.00, '4 weeks', 'accepted'),
     ($1, $3, 'I can implement the frontend visual dashboard with clean Tailwind CSS components and high-chart integrations.', 4800.00, '5 weeks', 'rejected');`,
    [proj1Id, userIds["freelancer@dev.com"], userIds["priya@designer.com"]]
  );

  // Proposals for Project 2 (AI Document Search)
  await query(
    `INSERT INTO proposals (project_id, freelancer_id, cover_letter, proposed_budget, estimated_duration, status)
     VALUES 
     ($1, $2, 'Specialized in vector embeddings, pgvector indexing, and FastAPI backends. Built semantic document search systems for 3 enterprise clients.', 5800.00, '3 weeks', 'pending'),
     ($1, $3, 'Extensive experience in full-stack Python + PostgreSQL microservices with Docker deployment.', 6000.00, '4 weeks', 'pending');`,
    [proj2Id, userIds["david@ml.com"], userIds["freelancer@dev.com"]]
  );

  // Accepted proposal for Project 3 (Design System)
  await query(
    `INSERT INTO proposals (project_id, freelancer_id, cover_letter, proposed_budget, estimated_duration, status)
     VALUES 
     ($1, $2, 'I will craft an accessible, production-ready design system with Figma tokens and React/Tailwind code.', 2200.00, '2 weeks', 'accepted');`,
    [proj3Id, userIds["priya@designer.com"]]
  );

  // 9. Seed Milestones
  console.log("Seeding project milestones...");
  const m1Res = await query(
    `INSERT INTO milestones (project_id, title, description, amount, due_date, status)
     VALUES 
     ($1, 'Database Schema & Core Authentication', 'PostgreSQL database setup with pgvector, user auth, and session controls.', 1500.00, '2026-11-20', 'paid'),
     ($1, 'Interactive Dashboard & Analytics Views', 'Real-time financial charts, view aggregations, and export features.', 1500.00, '2026-12-05', 'submitted'),
     ($1, 'End-to-End Testing & Production Deployment', 'Load testing, security auditing, and deployment onto containerized infrastructure.', 1500.00, '2026-12-20', 'pending')
     RETURNING id, title;`,
    [proj1Id]
  );

  // 10. Seed Tasks
  console.log("Seeding project tasks...");
  await query(
    `INSERT INTO tasks (project_id, assigned_to, milestone_id, title, description, status, priority, due_date)
     VALUES 
     ($1, $2, $3, 'Design normalized PostgreSQL schema and constraints', 'Implement 14+ normalized tables with appropriate foreign keys and CHECK constraints.', 'completed', 'high', '2026-11-18'),
     ($1, $2, $3, 'Implement pgvector cosine similarity matching', 'Setup 384-dimensional dense vectors and <=> distance queries.', 'completed', 'urgent', '2026-11-19'),
     ($1, $2, $4, 'Build reactive KPI analytics cards', 'Create responsive summary cards displaying totals, averages, and trend percentages.', 'in-progress', 'high', '2026-11-28'),
     ($1, $2, $4, 'Integrate PostgreSQL views for performance reports', 'Connect view_project_summaries and view_freelancer_performance to frontend.', 'todo', 'medium', '2026-12-02'),
     ($1, $2, NULL, 'Execute security vulnerability and injection scan', 'Verify prepared parameterized queries and authorization rules.', 'todo', 'urgent', '2026-12-10');`,
    [proj1Id, userIds["freelancer@dev.com"], m1Res.rows[0].id, m1Res.rows[1].id]
  );

  // 11. Seed Deliverables
  console.log("Seeding deliverables...");
  await query(
    `INSERT INTO project_deliverables (project_id, freelancer_id, title, file_url, notes, status)
     VALUES 
     ($1, $2, 'Milestone 1 Architecture & Codebase', 'https://github.com/freelancehub/repo-deliverable-m1.zip', 'Includes migration scripts, schema definitions, and auth middleware.', 'approved'),
     ($1, $2, 'Milestone 2 Analytics Implementation', 'https://github.com/freelancehub/repo-deliverable-m2.zip', 'Completed dashboard views and interactive charts for client review.', 'submitted');`,
    [proj1Id, userIds["freelancer@dev.com"]]
  );

  // 12. Seed Payments
  console.log("Seeding payment transactions...");
  await query(
    `INSERT INTO payments (project_id, client_id, freelancer_id, milestone_id, amount, payment_method, transaction_reference, status)
     VALUES 
     ($1, $2, $3, $4, 1500.00, 'Escrow', 'TXN-ACM-202611-001', 'completed'),
     ($5, $6, $7, NULL, 2200.00, 'Bank Transfer', 'TXN-APX-202611-002', 'completed');`,
    [
      proj1Id,
      userIds["client@acmecorp.com"],
      userIds["freelancer@dev.com"],
      m1Res.rows[0].id,
      proj3Id,
      userIds["client2@globaltech.com"],
      userIds["priya@designer.com"]
    ]
  );

  // 13. Seed Reviews (triggers automatic rating update)
  console.log("Seeding reviews (verifying database triggers)...");
  await query(
    `INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment)
     VALUES 
     ($1, $2, $3, 5, 'Exceptional engineering quality! Alex delivered the database and auth architecture ahead of schedule with zero defects.'),
     ($4, $5, $6, 5, 'Priya created an outstanding, modern design system. Great communication and beautiful attention to detail.');`,
    [
      proj1Id,
      userIds["client@acmecorp.com"],
      userIds["freelancer@dev.com"],
      proj3Id,
      userIds["client2@globaltech.com"],
      userIds["priya@designer.com"]
    ]
  );

  // 14. Seed Notifications
  console.log("Seeding user notifications...");
  await query(
    `INSERT INTO notifications (user_id, title, message, type, link)
     VALUES 
     ($1, 'Milestone Approved & Paid', 'Client Sarah Jenkins approved Milestone 1: $1,500.00 released to your account.', 'payment', '/freelancer/earnings'),
     ($2, 'Deliverable Submitted', 'Freelancer Alex Rivera submitted Milestone 2 deliverable for your review.', 'project', '/client/projects'),
     ($3, 'New Vector Project Match', 'New project matches 94.8% of your skill profile: AI-Powered Semantic Document Search Engine.', 'recommendation', '/freelancer/projects');`,
    [
      userIds["freelancer@dev.com"],
      userIds["client@acmecorp.com"],
      userIds["david@ml.com"]
    ]
  );

  console.log("Seeding completed successfully! All database entities, views, triggers, and vectors are active.");
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log("Migration & Seed finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration & Seed failed:", err);
      process.exit(1);
    });
}

module.exports = seed;
