/*
# EarnIQ Courses and Enhanced Tasks Schema

This migration adds:
- Courses catalog with modules and lessons
- Course progress tracking
- Quiz system
- Certificates
- Skill badges
- Enhanced task categories and demo tasks

## Tables Created:

### courses
- Course catalog with categories, difficulty levels
- Includes thumbnail, duration, ratings

### course_modules
- Module structure within courses
- Ordered lessons and assessments

### course_enrollments
- User enrollment and progress tracking
- Completion status and certificates

### quizzes
- Quiz questions for courses
- Multiple choice with correct answers

### quiz_attempts
- User quiz attempts and scores

### certificates
- Generated certificates for completed courses

### skill_badges
- Earned skill badges for achievements

*/

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('AI Prompt Engineering', 'Data Entry', 'Virtual Assistance', 'Content Writing', 'Social Media Management', 'Translation')),
  difficulty text NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  thumbnail_url text,
  duration_hours integer DEFAULT 1,
  lessons_count integer DEFAULT 0,
  enrolled_count integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  skills text[] DEFAULT '{}',
  prerequisites text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course modules
CREATE TABLE IF NOT EXISTS course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  video_url text,
  duration_minutes integer DEFAULT 10,
  order_index integer NOT NULL,
  has_quiz boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress decimal(5,2) DEFAULT 0,
  completed_lessons text[] DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  certificate_id uuid,
  UNIQUE(user_id, course_id)
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text,
  created_at timestamptz DEFAULT now()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  selected_answer integer,
  is_correct boolean,
  attempted_at timestamptz DEFAULT now()
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number text UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 12)),
  issued_at timestamptz DEFAULT now(),
  downloadable_url text
);

-- Skill badges
CREATE TABLE IF NOT EXISTS skill_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  level integer DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  earned_at timestamptz DEFAULT now(),
  icon text,
  color text,
  UNIQUE(user_id, skill_name)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_badges ENABLE ROW LEVEL SECURITY;

-- Courses policies (public read)
DROP POLICY IF EXISTS "courses_select_all" ON courses;
CREATE POLICY "courses_select_all" ON courses FOR SELECT
  TO authenticated USING (true);

-- Course enrollments policies
DROP POLICY IF EXISTS "enrollments_select_own" ON course_enrollments;
CREATE POLICY "enrollments_select_own" ON course_enrollments FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_insert_own" ON course_enrollments;
CREATE POLICY "enrollments_insert_own" ON course_enrollments FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_update_own" ON course_enrollments;
CREATE POLICY "enrollments_update_own" ON course_enrollments FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Quiz attempts policies
DROP POLICY IF EXISTS "quiz_attempts_select_own" ON quiz_attempts;
CREATE POLICY "quiz_attempts_select_own" ON quiz_attempts FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON quiz_attempts;
CREATE POLICY "quiz_attempts_insert_own" ON quiz_attempts FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Certificates policies
DROP POLICY IF EXISTS "certificates_select_own" ON certificates;
CREATE POLICY "certificates_select_own" ON certificates FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- Skill badges policies
DROP POLICY IF EXISTS "badges_select_own" ON skill_badges;
CREATE POLICY "badges_select_own" ON skill_badges FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "badges_insert_own" ON skill_badges;
CREATE POLICY "badges_insert_own" ON skill_badges FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Policies for modules, lessons, quizzes (read all for enrolled users)
DROP POLICY IF EXISTS "modules_select_all" ON course_modules;
CREATE POLICY "modules_select_all" ON course_modules FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "lessons_select_all" ON course_lessons;
CREATE POLICY "lessons_select_all" ON course_lessons FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "quizzes_select_all" ON quizzes;
CREATE POLICY "quizzes_select_all" ON quizzes FOR SELECT
  TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user ON skill_badges(user_id);

-- Insert demo courses
INSERT INTO courses (title, slug, description, category, difficulty, duration_hours, enrolled_count, rating, rating_count, skills, thumbnail_url) VALUES
('Introduction to AI Prompt Engineering', 'ai-prompt-engineering-101', 'Learn the fundamentals of crafting effective AI prompts. Master techniques for ChatGPT, Claude, and other AI models to get the best results.', 'AI Prompt Engineering', 'beginner', 4, 2450, 4.8, 156, ARRAY['Prompt Design', 'AI Communication', 'Problem Solving'], 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Advanced Prompt Engineering Strategies', 'advanced-prompt-engineering', 'Deep dive into advanced prompting techniques including chain-of-thought, few-shot learning, and prompt optimization.', 'AI Prompt Engineering', 'advanced', 6, 890, 4.9, 67, ARRAY['Chain-of-Thought', 'Few-Shot Learning', 'Prompt Optimization'], 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Data Entry Masterclass', 'data-entry-masterclass', 'Master data entry skills including spreadsheet management, data validation, and accuracy techniques for remote work.', 'Data Entry', 'beginner', 3, 3200, 4.6, 234, ARRAY['Excel', 'Data Validation', 'Accuracy'], 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Virtual Assistant Fundamentals', 'virtual-assistant-fundamentals', 'Learn to be an effective virtual assistant: email management, scheduling, research, and client communication.', 'Virtual Assistance', 'beginner', 5, 1870, 4.7, 145, ARRAY['Email Management', 'Scheduling', 'Research'], 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Content Writing Essentials', 'content-writing-essentials', 'Master the art of writing engaging content for blogs, websites, and social media. Learn SEO writing and editing.', 'Content Writing', 'beginner', 4, 2100, 4.8, 189, ARRAY['Copywriting', 'SEO Writing', 'Editing'], 'https://images.pexels.com/photos/261664/pexels-photo-261664.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Advanced Content Strategy', 'advanced-content-strategy', 'Develop content strategies that drive engagement. Learn content planning, analytics, and optimization.', 'Content Writing', 'advanced', 6, 670, 4.9, 52, ARRAY['Content Strategy', 'Analytics', 'Optimization'], 'https://images.pexels.com/photos/261664/pexels-photo-261664.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Social Media Management Pro', 'social-media-management', 'Learn to manage social media accounts, create content calendars, and grow engagement on major platforms.', 'Social Media Management', 'intermediate', 5, 1560, 4.7, 98, ARRAY['Content Planning', 'Engagement', 'Analytics'], 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Translation Fundamentals', 'translation-fundamentals', 'Learn professional translation techniques, quality assurance, and working with translation tools.', 'Translation', 'beginner', 4, 1890, 4.6, 134, ARRAY['Translation', 'Localization', 'Quality Assurance'], 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Professional Translation Mastery', 'translation-mastery', 'Advanced translation techniques for specialized content including technical, legal, and creative translation.', 'Translation', 'advanced', 6, 450, 4.8, 38, ARRAY['Technical Translation', 'Legal Translation', 'Creative Writing'], 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT (slug) DO NOTHING;

-- Insert demo tasks
INSERT INTO tasks (title, description, category, task_type, difficulty, payout_amount, estimated_time_minutes, skills_required, status, total_slots) VALUES
('Image Annotation for AI Training', 'Label objects in images to train computer vision AI models. Identify cars, pedestrians, traffic signs in urban scenes.', 'AI Training', 'annotation', 'beginner', 8.50, 30, ARRAY['Image Recognition', 'Attention to Detail'], 'active', 500),
('Text Data Classification', 'Categorize text passages into predefined categories. Help train text classification AI models.', 'AI Training', 'annotation', 'beginner', 6.00, 20, ARRAY['Reading Comprehension', 'Classification'], 'active', 800),
('Chatbot Response Rating', 'Rate AI chatbot responses for quality, accuracy, and helpfulness. Help improve conversational AI.', 'AI Training', 'annotation', 'intermediate', 12.00, 45, ARRAY['Critical Thinking', 'Language Skills'], 'active', 300),
('Customer Data Entry', 'Enter customer information from PDF documents into database systems. Verify accuracy of existing records.', 'Data Entry', 'annotation', 'beginner', 5.00, 25, ARRAY['Data Entry', 'Excel'], 'active', 600),
('Product Catalog Update', 'Update product descriptions, prices, and images in e-commerce platform. Maintain data accuracy.', 'Data Entry', 'annotation', 'beginner', 7.00, 40, ARRAY['Data Entry', 'E-commerce'], 'active', 250),
('Document Translation - English to Swahili', 'Translate marketing materials from English to Swahili. Maintain brand voice and accuracy.', 'Translation', 'translation', 'intermediate', 25.00, 60, ARRAY['Translation', 'Swahili', 'English'], 'active', 100),
('Website Localization - French', 'Translate website content from English to French. Adapt cultural context appropriately.', 'Translation', 'translation', 'advanced', 35.00, 90, ARRAY['Translation', 'French', 'Localization'], 'active', 50),
('Market Research Survey', 'Complete comprehensive market research surveys. Provide detailed feedback on consumer products.', 'Research', 'survey', 'beginner', 4.00, 15, ARRAY['Research', 'Communication'], 'active', 1000),
('Competitor Analysis Report', 'Research and document competitor products, pricing, and marketing strategies.', 'Research', 'survey', 'intermediate', 18.00, 60, ARRAY['Research', 'Analysis'], 'active', 75),
('Blog Article Writing', 'Write 1000-word blog articles on technology topics. Include SEO optimization.', 'Writing', 'annotation', 'intermediate', 20.00, 90, ARRAY['Content Writing', 'SEO'], 'active', 150),
('Product Description Writing', 'Create compelling product descriptions for e-commerce. 100-200 words per product.', 'Writing', 'annotation', 'beginner', 3.00, 15, ARRAY['Copywriting', 'E-commerce'], 'active', 400),
('Social Media Content Creation', 'Create engaging social media posts including captions and hashtag strategies.', 'Social Media', 'annotation', 'intermediate', 15.00, 45, ARRAY['Social Media', 'Content Creation'], 'active', 200),
('Instagram Story Design', 'Design Instagram story templates for brand campaigns. Use provided brand guidelines.', 'Social Media', 'annotation', 'intermediate', 12.00, 30, ARRAY['Social Media', 'Design'], 'active', 180),
('Audio Transcription', 'Transcribe audio interviews to text. Ensure accuracy and proper formatting.', 'AI Training', 'transcription', 'beginner', 10.00, 45, ARRAY['Transcription', 'Listening'], 'active', 350)
ON CONFLICT DO NOTHING;