/*
# Seed course modules and lessons

Creates modules and lessons for all 9 existing courses so the Learning Hub
course player has real content. Each course gets 2 modules with 3-4 lessons each.
*/

-- Introduction to AI Prompt Engineering (3ecdaac8)
INSERT INTO course_modules (course_id, title, description, order_index)
VALUES
('3ecdaac8-8e08-4404-b61a-6a67ea143ff7', 'Getting Started with AI', 'Learn the fundamentals of AI and prompt engineering', 1),
('3ecdaac8-8e08-4404-b61a-6a67ea143ff7', 'Crafting Effective Prompts', 'Master the art of writing clear, effective prompts', 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, content, duration_minutes, order_index, has_quiz)
SELECT m.id, l.title, l.content, l.duration, l.order_idx, l.has_quiz
FROM course_modules m
JOIN (VALUES
  ('Getting Started with AI', 'What is AI Prompt Engineering?', 'AI prompt engineering is the practice of designing inputs that guide AI models to produce useful outputs. In this lesson you will learn the basic terminology, how language models work at a high level, and why prompt quality matters.', 15, 1, true),
  ('Getting Started with AI', 'Understanding Language Models', 'Language models are trained on vast amounts of text data. They predict the next word in a sequence. This lesson covers how they generate responses and what their limitations are.', 12, 2, false),
  ('Getting Started with AI', 'The Prompt-Response Cycle', 'Every interaction with an AI follows a cycle: you write a prompt, the model processes it, and returns a response. Understanding this cycle helps you iterate and improve your results.', 10, 3, false),
  ('Crafting Effective Prompts', 'Writing Clear Instructions', 'The most important skill in prompt engineering is clarity. This lesson teaches you techniques for writing unambiguous, specific instructions that get better results.', 15, 1, true),
  ('Crafting Effective Prompts', 'Using Examples and Context', 'Providing examples in your prompts dramatically improves output quality. Learn how to use few-shot prompting and contextual framing.', 12, 2, false),
  ('Crafting Effective Prompts', 'Iterating and Refining', 'Your first prompt rarely produces the perfect result. Learn how to analyze outputs, identify weaknesses, and iterate to improve responses.', 10, 3, true)
) AS l(module_title, title, content, duration, order_idx, has_quiz)
ON m.title = l.module_title
ON CONFLICT DO NOTHING;

-- Advanced Prompt Engineering Strategies (54c6fc3b)
INSERT INTO course_modules (course_id, title, description, order_index)
VALUES
('54c6fc3b-effd-4d0a-955a-da214c951b18', 'Advanced Techniques', 'Chain-of-thought, tree-of-thought, and other advanced strategies', 1),
('54c6fc3b-effd-4d0a-955a-da214c951b18', 'Production Prompting', 'Scaling prompts for production systems and edge cases', 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, content, duration_minutes, order_index, has_quiz)
SELECT m.id, l.title, l.content, l.duration, l.order_idx, l.has_quiz
FROM course_modules m
JOIN (VALUES
  ('Advanced Techniques', 'Chain-of-Thought Prompting', 'Chain-of-thought prompting asks the model to reason step-by-step before giving a final answer. This technique significantly improves performance on complex reasoning tasks.', 18, 1, true),
  ('Advanced Techniques', 'Tree-of-Thought Prompting', 'Tree-of-thought expands on chain-of-thought by exploring multiple reasoning paths. Learn when to use it and how to implement it effectively.', 15, 2, false),
  ('Advanced Techniques', 'Self-Consistency and Verification', 'Self-consistency generates multiple responses and selects the most common answer. This lesson covers implementation and trade-offs.', 12, 3, true),
  ('Production Prompting', 'Prompt Templates and Variables', 'In production, prompts need to be reusable and parameterized. Learn how to build prompt templates with variables for scalability.', 15, 1, false),
  ('Production Prompting', 'Handling Edge Cases', 'Production prompts must handle unexpected inputs gracefully. This lesson covers fallback strategies, input validation, and error handling.', 12, 2, true)
) AS l(module_title, title, content, duration, order_idx, has_quiz)
ON m.title = l.module_title
ON CONFLICT DO NOTHING;

-- Data Entry Masterclass (d5147a42)
INSERT INTO course_modules (course_id, title, description, order_index)
VALUES
('d5147a42-e626-4213-8503-3c6456ee2e73', 'Data Entry Fundamentals', 'Master the basics of accurate, efficient data entry', 1),
('d5147a42-e626-4213-8503-3c6456ee2e73', 'Tools and Efficiency', 'Use spreadsheets and tools to work faster', 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, content, duration_minutes, order_index, has_quiz)
SELECT m.id, l.title, l.content, l.duration, l.order_idx, l.has_quiz
FROM course_modules m
JOIN (VALUES
  ('Data Entry Fundamentals', 'Introduction to Data Entry', 'Data entry is the process of inputting information into electronic formats. Accuracy and speed are the two most important skills. This lesson covers the basics.', 12, 1, false),
  ('Data Entry Fundamentals', 'Accuracy Best Practices', 'Learn proven techniques for maintaining high accuracy: double-entry verification, validation rules, and quality checks.', 15, 2, true),
  ('Data Entry Fundamentals', 'Keyboard Shortcuts', 'Speed up your work with keyboard shortcuts for common data entry tasks. This lesson covers the most useful shortcuts for spreadsheets.', 10, 3, false),
  ('Tools and Efficiency', 'Spreadsheet Mastery', 'Master Excel and Google Sheets functions that automate data entry: VLOOKUP, INDEX/MATCH, data validation, and conditional formatting.', 18, 1, true),
  ('Tools and Efficiency', 'Data Cleaning Techniques', 'Real-world data is messy. Learn how to identify and fix common data quality issues: duplicates, formatting inconsistencies, and missing values.', 12, 2, false)
) AS l(module_title, title, content, duration, order_idx, has_quiz)
ON m.title = l.module_title
ON CONFLICT DO NOTHING;

-- Virtual Assistant Fundamentals (693eea5f)
INSERT INTO course_modules (course_id, title, description, order_index)
VALUES
('693eea5f-2a52-4605-9b36-596807f472a6', 'VA Essentials', 'Core skills every virtual assistant needs', 1),
('693eea5f-2a52-4605-9b36-596807f472a6', 'Client Management', 'How to find, communicate with, and retain clients', 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, content, duration_minutes, order_index, has_quiz)
SELECT m.id, l.title, l.content, l.duration, l.order_idx, l.has_quiz
FROM course_modules m
JOIN (VALUES
  ('VA Essentials', 'What Does a Virtual Assistant Do?', 'Virtual assistants provide remote support services: email management, scheduling, research, data entry, and more. This lesson covers the full scope of VA work.', 12, 1, false),
  ('VA Essentials', 'Essential VA Tools', 'Learn the tools every VA should know: Google Workspace, Slack, Trello, Notion, and calendar management tools.', 15, 2, true),
  ('VA Essentials', 'Time Zone Management', 'Working across time zones is a core VA skill. Learn strategies for scheduling, communication, and setting expectations.', 10, 3, false),
  ('Client Management', 'Finding Your First Client', 'Practical strategies for landing your first VA client: platforms, cold outreach, networking, and building a portfolio.', 15, 1, true),
  ('Client Management', 'Client Communication', 'Clear, professional communication is the key to client retention. Learn email etiquette, status reporting, and managing expectations.', 12, 2, false)
) AS l(module_title, title, content, duration, order_idx, has_quiz)
ON m.title = l.module_title
ON CONFLICT DO NOTHING;

-- Content Writing Essentials (19379348)
INSERT INTO course_modules (course_id, title, description, order_index)
VALUES
('19379348-d452-4a01-90b0-76c1b07fb57a', 'Writing Fundamentals', 'The building blocks of great content writing', 1),
('19379348-d452-4a01-90b0-76c1b07fb57a', 'Content Types', 'Master different content formats', 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, content, duration_minutes, order_index, has_quiz)
SELECT m.id, l.title, l.content, l.duration, l.order_idx, l.has_quiz
FROM course_modules m
JOIN (VALUES
  ('Writing Fundamentals', 'The Anatomy of Great Content', 'Great content informs, engages, and persuades. Learn the structure: compelling headlines, strong openings, clear body, and effective calls to action.', 15, 1, true),
  ('Writing Fundamentals', 'Writing for Your Audience', 'Understanding your audience is the foundation of content writing. Learn how to research demographics, match tone, and address pain points.', 12, 2, false),
  ('Writing Fundamentals', 'SEO Writing Basics', 'Learn how to write content that ranks in search engines: keyword research, on-page optimization, and writing for both humans and search engines.', 15, 3, true),
  ('Content Types', 'Blog Posts and Articles', 'Master the blog post format: structure, formatting, readability, and engagement techniques that keep readers on the page.', 12, 1, false),
  ('Content Types', 'Email and Copywriting', 'Email marketing and copywriting require a different approach. Learn to write subject lines, CTAs, and persuasive copy that converts.', 15, 2, true)
) AS l(module_title, title, content, duration, order_idx, has_quiz)
ON m.title = l.module_title
ON CONFLICT DO NOTHING;

-- Advanced Content Strategy (312706ca)
INSERT INTO course_modules (course_id, title, description, order_index)
VALUES
('312706ca-75da-44cc-97cd-fed85eb1735c', 'Content Strategy', 'Plan and execute a content strategy that drives results', 1),
('312706ca-75da-44cc-97cd-fed85eb1735c', 'Analytics and Optimization', 'Measure and improve your content performance', 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, content, duration_minutes, order_index, has_quiz)
SELECT m.id, l.title, l.content, l.duration, l.order_idx, l.has_quiz
FROM course_modules m
JOIN (VALUES
  ('Content Strategy', 'Building a Content Calendar', 'A content calendar keeps you consistent. Learn how to plan topics, schedule publications, and align content with business goals.', 15, 1, true),
  ('Content Strategy', 'Content Repurposing', 'Maximize the value of every piece of content by repurposing it across formats: blog to video, video to social, etc.', 12, 2, false),
  ('Analytics and Optimization', 'Measuring Content Success', 'Learn which metrics matter: traffic, engagement, conversion, and ROI. Use tools like Google Analytics to track performance.', 15, 3, true),
  ('Analytics and Optimization', 'A/B Testing Content', 'Test headlines, CTAs, and formats to continuously improve. Learn the methodology of content experimentation.', 12, 4, false)
) AS l(module_title, title, content, duration, order_idx, has_quiz)
ON m.title = l.module_title
ON CONFLICT DO NOTHING;

-- Social Media Management Pro (0f6dff63)
INSERT INTO course_modules (course_id, title, description, order_index)
VALUES
('0f6dff63-2b7c-42db-8214-e50f571c3d4c', 'Social Media Foundations', 'Build a strong social media presence', 1),
('0f6dff63-2b7c-42db-8214-e50f571c3d4c', 'Growth and Engagement', 'Grow your following and drive engagement', 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, content, duration_minutes, order_index, has_quiz)
SELECT m.id, l.title, l.content, l.duration, l.order_idx, l.has_quiz
FROM course_modules m
JOIN (VALUES
  ('Social Media Foundations', 'Platform Strategy', 'Each platform has unique characteristics. Learn how to choose the right platforms and tailor content for each: Instagram, Twitter, LinkedIn, TikTok.', 15, 1, true),
  ('Social Media Foundations', 'Content Planning', 'Plan a month of social media content in advance. Learn content pillars, posting frequency, and batch creation.', 12, 2, false),
  ('Social Media Foundations', 'Visual Content Creation', 'Create eye-catching visuals with free tools. Learn Canva, basic design principles, and how to maintain brand consistency.', 15, 3, false),
  ('Growth and Engagement', 'Growing Your Following', 'Organic growth strategies: hashtags, collaborations, user-generated content, and community building.', 15, 1, true),
  ('Growth and Engagement', 'Community Management', 'Engage with your audience effectively. Learn response strategies, handling negative comments, and building brand loyalty.', 12, 2, true)
) AS l(module_title, title, content, duration, order_idx, has_quiz)
ON m.title = l.module_title
ON CONFLICT DO NOTHING;

-- Translation Fundamentals (a545ed30)
INSERT INTO course_modules (course_id, title, description, order_index)
VALUES
('a545ed30-ef70-4e23-9998-149c10f25d85', 'Translation Basics', 'Core principles of professional translation', 1),
('a545ed30-ef70-4e23-9998-149c10f25d85', 'Working as a Translator', 'Practical skills for a translation career', 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, content, duration_minutes, order_index, has_quiz)
SELECT m.id, l.title, l.content, l.duration, l.order_idx, l.has_quiz
FROM course_modules m
JOIN (VALUES
  ('Translation Basics', 'What is Professional Translation?', 'Translation is more than word-for-word conversion. Learn the principles of meaning-based translation, cultural adaptation, and maintaining tone.', 15, 1, true),
  ('Translation Basics', 'Translation vs. Localization', 'Localization adapts content for a specific locale. Learn the difference and when each approach is appropriate.', 12, 2, false),
  ('Translation Basics', 'Common Translation Challenges', 'Idioms, cultural references, humor, and technical terms are the hardest parts of translation. Learn strategies for handling each.', 15, 3, true),
  ('Working as a Translator', 'Translation Tools and CAT', 'Computer-Assisted Translation tools like SDL Trados and memoQ are industry standards. Learn the basics of how they work.', 12, 1, false),
  ('Working as a Translator', 'Finding Translation Work', 'Platforms, agencies, and direct clients: learn where to find translation jobs and how to build a translation portfolio.', 15, 2, true)
) AS l(module_title, title, content, duration, order_idx, has_quiz)
ON m.title = l.module_title
ON CONFLICT DO NOTHING;

-- Professional Translation Mastery (95a5dc76)
INSERT INTO course_modules (course_id, title, description, order_index)
VALUES
('95a5dc76-bf49-42e4-82f0-91fcd7c36cb5', 'Specialized Translation', 'Master niche translation domains', 1),
('95a5dc76-bf49-42e4-82f0-91fcd7c36cb5', 'Quality Assurance', 'Deliver translation quality that earns repeat business', 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (module_id, title, content, duration_minutes, order_index, has_quiz)
SELECT m.id, l.title, l.content, l.duration, l.order_idx, l.has_quiz
FROM course_modules m
JOIN (VALUES
  ('Specialized Translation', 'Legal Translation', 'Legal translation requires precision and knowledge of legal systems. Learn terminology, conventions, and certification requirements.', 18, 1, true),
  ('Specialized Translation', 'Medical Translation', 'Medical translation demands accuracy and subject knowledge. Learn medical terminology, regulatory requirements, and quality standards.', 15, 2, false),
  ('Specialized Translation', 'Technical Translation', 'Technical documents require domain expertise. Learn how to handle technical terminology, maintain consistency, and use glossaries.', 15, 3, true),
  ('Quality Assurance', 'Translation Quality Assurance', 'QA processes ensure consistent quality: proofreading, back-translation, and peer review. Learn the full QA workflow.', 15, 1, true),
  ('Quality Assurance', 'Building a Translation Business', 'Turn your skills into a sustainable business: pricing, contracts, client relationships, and scaling.', 12, 2, false)
) AS l(module_title, title, content, duration, order_idx, has_quiz)
ON m.title = l.module_title
ON CONFLICT DO NOTHING;
