-- Seed job_levels
INSERT INTO job_levels (name) VALUES
  ('entry level'),
  ('mid level'),
  ('senior level'),
  ('director'),
  ('VP or above');

-- Seed required_skills
INSERT INTO required_skills (name) VALUES
  ('Reactjs'),
  ('Nextjs'),
  ('Nodejs'),
  ('Javascript'),
  ('Typescript'),
  ('HTML'),
  ('CSS'),
  ('Vuejs'),
  ('Angular'),
  ('Python'),
  ('Java'),
  ('C#'),
  ('C++'),
  ('Go'),
  ('SQL'),
  ('MongoDB'),
  ('PostgreSQL'),
  ('MySQL'),
  ('Docker'),
  ('Kubernetes'),
  ('AWS'),
  ('Azure'),
  ('GCP'),
  ('Redis'),
  ('GraphQL'),
  ('REST API'),
  ('CI/CD'),
  ('Jest'),
  ('Testing Library'),
  ('SASS'),
  ('LESS'),
  ('Webpack'),
  ('Babel');

-- Seed employment_types
INSERT INTO employment_types (name) VALUES
  ('full-time'),
  ('part-time'),
  ('remote'),
  ('internship'),
  ('hybrid'),
  ('contract');

-- Seed categories
INSERT INTO categories (name) VALUES
  ('design'),
  ('sales'),
  ('marketing'),
  ('business'),
  ('human resource'),
  ('finance'),
  ('engineering'),
  ('technology');

-- Mock 2 jobs
INSERT INTO jobs (title, description, company_id, website_url, salary_from, salary_to, salary_text, salary_currency, job_posted_at, job_deadline, status, created_at, updated_at)
VALUES
  ('Frontend Developer', 'Work on modern web apps.', 1, 'https://acme.com/jobs/frontend', 1000, 2000, 'Negotiable', 'USD', '2025-11-01', '2025-12-01', 'open', NOW(), NOW()),
  ('Backend Engineer', 'Develop scalable APIs.', 2, 'https://betainno.com/jobs/backend', 1200, 2500, 'Competitive', 'USD', '2025-11-05', '2025-12-10', 'open', NOW(), NOW());