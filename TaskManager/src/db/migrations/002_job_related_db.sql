
CREATE TABLE job_levels (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE required_skills (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE employment_types (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE categories (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


CREATE TABLE jobs (
  id bigserial PRIMARY KEY,
  external_id bigint UNIQUE, -- source id (e.g. topcv job id)
  website_url text,
  title text NOT NULL,
  company_id bigint REFERENCES companies(id) ON DELETE SET NULL,
  salary_from numeric,
  salary_to numeric,
  salary_text text,
  salary_currency text,
  job_posted_at date,
  job_deadline date,
  status text,
  description text,
  company_branches_id bigint REFERENCES company_branches(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE job_categories (
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, category_id)
);

CREATE TABLE job_required_skills (
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  required_skill_id BIGINT NOT NULL REFERENCES required_skills(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, required_skill_id)
);

CREATE TABLE job_employment_types (
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  employment_type_id BIGINT NOT NULL REFERENCES employment_types(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, employment_type_id)
);

CREATE TABLE job_levels_jobs (
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_level_id BIGINT NOT NULL REFERENCES job_levels(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, job_level_id)
);