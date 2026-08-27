CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS respondents (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  surname text,
  gender text,
  date_of_birth date,
  phone text,
  formatted_address text,
  suburb text,
  city text,
  province text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  knows_cell_group boolean,
  submitted_at timestamptz,
  device text
);

CREATE TABLE IF NOT EXISTS identified_answers (
  id uuid primary key default gen_random_uuid(),
  respondent_id uuid references respondents(id),
  section text,
  question_key text,
  answer text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS anonymous_answers (
  id uuid primary key default gen_random_uuid(),
  section text,
  question_key text,
  answer text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS follow_up_requests (
  id uuid primary key default gen_random_uuid(),
  respondent_id uuid references respondents(id),
  topic text,
  created_at timestamptz default now()
);
