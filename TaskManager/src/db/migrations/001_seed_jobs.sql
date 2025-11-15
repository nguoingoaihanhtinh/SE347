-- 001_seed_jobs.sql
-- Seed sample data for jobs, companies, locations to match mock API

-- Companies
INSERT INTO companies (external_id, name, logo, url)
VALUES
  (1001, 'Company A', 'https://logo.com/a.png', 'https://cong-ty/a'),
  (1002, 'Company B', 'https://logo.com/b.png', 'https://cong-ty/b');

-- Categories
INSERT INTO categories (name) VALUES ('IT'), ('Finance'), ('Marketing');

-- Experiences
INSERT INTO experiences (name) VALUES ('Junior'), ('Mid'), ('Senior');

-- Locations
INSERT INTO locations (city, district, full_name) VALUES
  ('Hồ Chí Minh', 'Phú Nhuận', 'Hồ Chí Minh: Phú Nhuận'),
  ('Hà Nội', 'Cầu Giấy', 'Hà Nội: Cầu Giấy');

-- Jobs
INSERT INTO jobs (external_id, url, title, company_id, category_id, experience_id, salary_from, salary_to, salary_text, salary_currency, deadline, publish, updated_at)
VALUES
  (2001, 'https://topcv.vn/viec-lam/example1.html', 'PHP Developer', 1, 1, 2, 100000, 1000000, '100000 - 1000000 triệu', 'triệu', '2024-01-01', '5 tháng trước', now()),
  (2002, 'https://topcv.vn/viec-lam/example2.html', 'Frontend Engineer', 2, 1, 3, 150000, 1200000, '150000 - 1200000 triệu', 'triệu', '2025-01-01', '2 tháng trước', now());

-- Link job_locations
INSERT INTO job_locations (job_id, location_id) VALUES
  ((SELECT id FROM jobs WHERE external_id = 2001), (SELECT id FROM locations WHERE full_name = 'Hồ Chí Minh: Phú Nhuận')),
  ((SELECT id FROM jobs WHERE external_id = 2002), (SELECT id FROM locations WHERE full_name = 'Hà Nội: Cầu Giấy'));