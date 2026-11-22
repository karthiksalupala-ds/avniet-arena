-- ==============================================================
-- AVNIET ARENA — POSTGRESQL CLOUD DATABASE SCHEMA FOR SUPABASE
-- Run this in your Supabase Project -> SQL Editor to initialize
-- ==============================================================

-- 1. Create Examinations Table
CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'aptitude',
  category TEXT DEFAULT 'Placement Assessment',
  description TEXT,
  duration_minutes INTEGER DEFAULT 15,
  question_count INTEGER DEFAULT 30,
  total_marks NUMERIC(6, 2) DEFAULT 30.0,
  marks_per_correct NUMERIC(4, 2) DEFAULT 1.0,
  negative_mark NUMERIC(4, 2) DEFAULT 0.25,
  marking_policy TEXT DEFAULT 'gate',
  target_batches TEXT[] DEFAULT ARRAY['2027', '2028'],
  target_departments TEXT[] DEFAULT ARRAY['CSE', 'IT', 'CSM', 'CSD', 'ECE'],
  proctoring_strictness TEXT DEFAULT 'strict',
  status TEXT DEFAULT 'LIVE',
  questions JSONB DEFAULT '[]'::jsonb,
  game_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Candidate Submissions Table (Indexed for 1,000+ Concurrent Students)
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  submission_id TEXT UNIQUE NOT NULL,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  roll TEXT NOT NULL,
  name TEXT,
  branch TEXT NOT NULL DEFAULT 'CSE',
  batch TEXT NOT NULL DEFAULT '2028',
  score NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  accuracy TEXT DEFAULT '0%',
  time_taken TEXT DEFAULT '00m 00s',
  trust_score TEXT DEFAULT '100%',
  tab_switches INTEGER DEFAULT 0,
  status TEXT DEFAULT 'VERIFIED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for sub-millisecond query performance
CREATE INDEX IF NOT EXISTS idx_submissions_exam ON submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_submissions_roll ON submissions(roll);
CREATE INDEX IF NOT EXISTS idx_submissions_score ON submissions(score DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- 3. Create Real-Time Proctoring & Audit Event Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  time_str TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  detail TEXT,
  status TEXT DEFAULT 'INFO',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- 4. Enable Supabase Realtime Broadcasting (Instantly pushes to Admin Dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

-- 5. Seed Default Examinations
INSERT INTO exams (id, title, type, category, description, duration_minutes, question_count, total_marks, marks_per_correct, negative_mark, status)
VALUES 
(
  'EXAM-AVN-2026-APT',
  'Placement Readiness Aptitude & Technical Assessment',
  'aptitude',
  'Placement Assessment',
  'Comprehensive campus placement mock covering Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Core CS.',
  15, 30, 30.0, 1.0, 0.25, 'LIVE'
),
(
  'EXAM-AVN-2026-COG',
  'Capgemini Cognitive Deductive Logic Round',
  'game',
  'Game-based Cognitive Assessment',
  'Sudoku-style Latin Square deductive puzzle challenge evaluating cognitive speed and pattern deduction.',
  2, 1, 50.0, 10.0, 0.0, 'LIVE'
)
ON CONFLICT (id) DO NOTHING;
