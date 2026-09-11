/*
# EarnIQ Africa Database Schema

This migration creates the core schema for the EarnIQ Africa platform including:
- User profiles with role-based access (worker, client, admin)
- Tasks marketplace with categories and payouts
- Wallet system with M-Pesa integration
- Withdrawal tracking
- Skills and learning paths
- Referral system
- Activity logging

## Tables Created:

### profiles
- Extends auth.users with additional profile information
- Tracks user_type (worker, client, admin)
- Stores profile completion status and personal details
- Stores skills, country, phone, and avatar

### tasks
- Available tasks for workers to complete
- Includes task type, payout, difficulty, and status
- Links to categories and estimated completion time

### user_tasks
- Junction table tracking task assignments to workers
- Tracks completion status, quality scores, and earnings
- Links workers to tasks with timestamps

### wallets
- User wallet balances
- Tracks total, pending, and available earnings
- Records total withdrawn and withdrawal count

### withdrawals
- M-Pesa withdrawal requests
- Tracks status, amount, phone number, and transaction IDs
- Includes failure reasons for debugging

### skills
- Available skills in the platform
- Includes category, description, and learner counts

### user_skills
- User-skill associations with proficiency levels
- Tracks progress percentage and completion status

### referrals
- Referral tracking system
- Links referrer to referee with reward tracking

### activity_logs
- Platform activity tracking
- Records user actions with metadata

## Security
- RLS enabled on all tables
- Owner-scoped policies for user data
- Workers can only access their own tasks and wallets
- Admin access pattern for platform management
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  user_type text NOT NULL DEFAULT 'worker' CHECK (user_type IN ('worker', 'client', 'admin')),
  phone text,
  country text,
  city text,
  bio text,
  skills text[] DEFAULT '{}',
  profile_completed boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  onboarding_completed boolean DEFAULT false,
  referral_code text UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 8)),
  referred_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  task_type text NOT NULL DEFAULT 'annotation' CHECK (task_type IN ('annotation', 'moderation', 'coding', 'survey', 'testing', 'transcription', 'translation')),
  difficulty text NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  payout_amount decimal(10,2) NOT NULL,
  payout_currency text DEFAULT 'USD',
  estimated_time_minutes integer NOT NULL,
  instructions text,
  requirements jsonb DEFAULT '{}',
  skills_required text[] DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  total_slots integer DEFAULT 100,
  slots_filled integer DEFAULT 0,
  quality_threshold decimal(3,2) DEFAULT 0.80,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User tasks (task assignments)
CREATE TABLE IF NOT EXISTS user_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status text DEFAULT 'in_progress' CHECK (status IN ('assigned', 'in_progress', 'submitted', 'approved', 'rejected', 'disputed')),
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  completed_at timestamptz,
  quality_score decimal(3,2),
  earnings decimal(10,2),
  feedback text,
  submission_data jsonb DEFAULT '{}',
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(user_id, task_id)
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  total_earnings decimal(12,2) DEFAULT 0,
  pending_earnings decimal(12,2) DEFAULT 0,
  available_balance decimal(12,2) DEFAULT 0,
  total_withdrawn decimal(12,2) DEFAULT 0,
  withdrawal_count integer DEFAULT 0,
  currency text DEFAULT 'USD',
  mpesa_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  mpesa_phone text NOT NULL,
  mpesa_transaction_id text,
  failure_reason text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills catalog
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  description text,
  icon text,
  difficulty text DEFAULT 'beginner',
  learner_count integer DEFAULT 0,
  growth_rate decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User skills
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level integer DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  progress decimal(5,2) DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  certificate_url text,
  UNIQUE(user_id, skill_id)
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded', 'cancelled')),
  reward_amount decimal(10,2) DEFAULT 5.00,
  reward_status text DEFAULT 'pending' CHECK (reward_status IN ('pending', 'paid', 'cancelled')),
  qualified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referee_id)
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR user_type = 'admin' AND auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Tasks policies (all authenticated can view active tasks)
DROP POLICY IF EXISTS "tasks_select_all" ON tasks;
CREATE POLICY "tasks_select_all" ON tasks FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "tasks_insert_admin" ON tasks;
CREATE POLICY "tasks_insert_admin" ON tasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'client'))
  );

DROP POLICY IF EXISTS "tasks_update_admin" ON tasks;
CREATE POLICY "tasks_update_admin" ON tasks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'client'))
  );

-- User tasks policies
DROP POLICY IF EXISTS "user_tasks_select_own" ON user_tasks;
CREATE POLICY "user_tasks_select_own" ON user_tasks FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

DROP POLICY IF EXISTS "user_tasks_insert_own" ON user_tasks;
CREATE POLICY "user_tasks_insert_own" ON user_tasks FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_tasks_update_own" ON user_tasks;
CREATE POLICY "user_tasks_update_own" ON user_tasks FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Wallets policies
DROP POLICY IF EXISTS "wallets_select_own" ON wallets;
CREATE POLICY "wallets_select_own" ON wallets FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "wallets_insert_own" ON wallets;
CREATE POLICY "wallets_insert_own" ON wallets FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "wallets_update_own" ON wallets;
CREATE POLICY "wallets_update_own" ON wallets FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Withdrawals policies
DROP POLICY IF EXISTS "withdrawals_select_own" ON withdrawals;
CREATE POLICY "withdrawals_select_own" ON withdrawals FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "withdrawals_insert_own" ON withdrawals;
CREATE POLICY "withdrawals_insert_own" ON withdrawals FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Skills policies (public read)
DROP POLICY IF EXISTS "skills_select_all" ON skills;
CREATE POLICY "skills_select_all" ON skills FOR SELECT
  TO authenticated USING (true);

-- User skills policies
DROP POLICY IF EXISTS "user_skills_select_own" ON user_skills;
CREATE POLICY "user_skills_select_own" ON user_skills FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_skills_insert_own" ON user_skills;
CREATE POLICY "user_skills_insert_own" ON user_skills FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_skills_update_own" ON user_skills;
CREATE POLICY "user_skills_update_own" ON user_skills FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Referrals policies
DROP POLICY IF EXISTS "referrals_select_own" ON referrals;
CREATE POLICY "referrals_select_own" ON referrals FOR SELECT
  TO authenticated USING (referrer_id = auth.uid() OR referee_id = auth.uid());

DROP POLICY IF EXISTS "referrals_insert_own" ON referrals;
CREATE POLICY "referrals_insert_own" ON referrals FOR INSERT
  TO authenticated WITH CHECK (referrer_id = auth.uid());

-- Activity logs policies
DROP POLICY IF EXISTS "activity_logs_select_own" ON activity_logs;
CREATE POLICY "activity_logs_select_own" ON activity_logs FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "activity_logs_insert_own" ON activity_logs;
CREATE POLICY "activity_logs_insert_own" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON withdrawals;
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default skills
INSERT INTO skills (name, category, description, icon, difficulty, learner_count, growth_rate) VALUES
('AI & Machine Learning', 'Technology', 'Learn to train AI models and understand machine learning fundamentals', 'Brain', 'intermediate', 12450, 34),
('Digital Design', 'Creative', 'Master design tools and create stunning visual content', 'Palette', 'beginner', 8230, 28),
('Web Development', 'Technology', 'Build modern websites and web applications', 'Code', 'intermediate', 15780, 45),
('Data Analysis', 'Technology', 'Analyze data and create meaningful insights', 'BarChart3', 'intermediate', 9120, 52),
('Digital Marketing', 'Business', 'Learn online marketing strategies and techniques', 'Megaphone', 'beginner', 11340, 38),
('Cloud Computing', 'Technology', 'Understand cloud infrastructure and services', 'Cloud', 'advanced', 6890, 61),
('Content Writing', 'Creative', 'Create compelling content for various platforms', 'FileText', 'beginner', 10210, 25),
('Mobile Development', 'Technology', 'Build mobile apps for iOS and Android', 'Smartphone', 'intermediate', 7890, 42),
('Cybersecurity', 'Technology', 'Learn to protect systems and data', 'Shield', 'advanced', 4230, 55),
('Project Management', 'Business', 'Manage projects effectively using modern tools', 'ClipboardList', 'intermediate', 5780, 31)
ON CONFLICT (name) DO NOTHING;