-- 001_create_jobs.sql
-- Normalized schema for jobs service (companies, categories, experiences, locations, jobs, job_locations)
CREATE TABLE users (
  user_id bigserial PRIMARY KEY,
  avatar text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  role text NOT NULL, 
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


CREATE TABLE countries (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE provinces (
  id bigserial PRIMARY KEY,
  country_id bigint REFERENCES countries(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE wards (
  id bigserial PRIMARY KEY,
  province_id bigint REFERENCES provinces(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE company_types (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE companies (
  id bigserial PRIMARY KEY,
  external_id bigint,
  name text NOT NULL,
  tech_stack text[],
  logo text,
  background text,
  description text,
  phone text,
  email text,
  website_url text,
  socials jsonb,
  images text[],
  employee_count numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE company_company_types (
  company_id bigint REFERENCES companies(id) ON DELETE CASCADE,
  company_type_id bigint REFERENCES company_types(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, company_type_id)
);

CREATE TABLE company_branches (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  company_id bigint REFERENCES companies(id) ON DELETE CASCADE,
  country_id bigint REFERENCES countries(id) ON DELETE SET NULL,
  province_id bigint REFERENCES provinces(id) ON DELETE SET NULL,
  ward_id bigint REFERENCES wards(id) ON DELETE SET NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);



CREATE TABLE categories (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);







-- CREATE TABLE experiences (
--   id bigserial PRIMARY KEY,
--   name text NOT NULL,
--   created_at timestamptz DEFAULT now(),
--   updated_at timestamptz DEFAULT now()
-- );


-- CREATE TABLE jobs (
--   id bigserial PRIMARY KEY,
--   external_id bigint UNIQUE, -- source id (e.g. topcv job id)
--   url text,
--   title text NOT NULL,
--   company_id bigint REFERENCES companies(id) ON DELETE SET NULL,
--   category_id bigint REFERENCES categories(id) ON DELETE SET NULL,
--   experience_id bigint REFERENCES experiences(id) ON DELETE SET NULL,
--   salary_from numeric,
--   salary_to numeric,
--   salary_text text,
--   salary_currency text,
--   deadline date,
--   publish text,
--   updated_at timestamptz,
--   created_at timestamptz DEFAULT now()
-- );

-- CREATE TABLE job_locations (
--   job_id bigint REFERENCES jobs(id) ON DELETE CASCADE,
--   location_id bigint REFERENCES locations(id) ON DELETE CASCADE,
--   PRIMARY KEY (job_id, location_id)
-- );

-- -- Indexes for faster filters/searches
-- CREATE INDEX idx_jobs_title ON jobs USING gin (to_tsvector('simple', title));
-- CREATE INDEX idx_jobs_external_id ON jobs (external_id);
-- CREATE INDEX idx_jobs_company_id ON jobs (company_id);
-- CREATE INDEX idx_locations_full_name ON locations (full_name);

-- -- Optional: view to return job payload similar to mock API
-- CREATE VIEW vw_jobs_with_company AS
-- SELECT
--   j.*,
--   json_build_object('name', c.name, 'logo', c.logo, 'url', c.url) AS company,
--   json_build_object('from', j.salary_from, 'to', j.salary_to, 'text', j.salary_text, 'currency', j.salary_currency) AS salary,
--   (SELECT json_agg(l.full_name) FROM job_locations jl JOIN locations l ON l.id = jl.location_id WHERE jl.job_id = j.id) AS locations
-- FROM jobs j
-- LEFT JOIN companies c ON c.id = j.company_id;