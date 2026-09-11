import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Brain,
  Play,
  Clock,
  Users,
  Star,
  CheckCircle2,
  Award,
  Trophy,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  Target,
  Sparkles,
  FileText,
  Globe,
  MessageSquare,
  TrendingUp,
  Lock,
  X,
  Download,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import type { Course, CourseEnrollment, Certificate, SkillBadge } from '../../types/database';

type CourseWithEnrollment = Course & {
  enrollment?: CourseEnrollment;
};

type Lesson = {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  has_quiz: boolean;
};

type Module = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
};

const categoryIcons: Record<string, React.ReactElement> = {
  'AI Prompt Engineering': <Brain className="w-6 h-6" />,
  'Data Entry': <FileText className="w-6 h-6" />,
  'Virtual Assistance': <Users className="w-6 h-6" />,
  'Content Writing': <BookOpen className="w-6 h-6" />,
  'Social Media Management': <MessageSquare className="w-6 h-6" />,
  'Translation': <Globe className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  'AI Prompt Engineering': 'from-purple-500 via-indigo-500 to-blue-600',
  'Data Entry': 'from-green-500 via-emerald-500 to-teal-600',
  'Virtual Assistance': 'from-blue-500 via-sky-500 to-cyan-600',
  'Content Writing': 'from-amber-500 via-orange-500 to-red-500',
  'Social Media Management': 'from-pink-500 via-rose-500 to-red-500',
  'Translation': 'from-teal-500 via-cyan-500 to-blue-600',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400',
  intermediate: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400',
  advanced: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400',
};

export default function LearningHub() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithEnrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [badges, setBadges] = useState<SkillBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'explore' | 'learning' | 'certificates' | 'badges'>('explore');

  // Course player state
  const [playerCourse, setPlayerCourse] = useState<CourseWithEnrollment | null>(null);
  const [playerModules, setPlayerModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);

  const categories = ['AI Prompt Engineering', 'Data Entry', 'Virtual Assistance', 'Content Writing', 'Social Media Management', 'Translation'];

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('enrolled_count', { ascending: false });

    const { data: enrollmentsData } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', profile?.id || '');

    const { data: certsData } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', profile?.id || '');

    const { data: badgesData } = await supabase
      .from('skill_badges')
      .select('*')
      .eq('user_id', profile?.id || '');

    let mergedCourses: CourseWithEnrollment[] = [];
    if (coursesData && enrollmentsData) {
      mergedCourses = coursesData.map(course => ({
        ...course,
        enrollment: enrollmentsData.find(e => e.course_id === course.id),
      }));
    }

    let filtered = mergedCourses;
    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    if (selectedDifficulty) {
      filtered = filtered.filter(c => c.difficulty === selectedDifficulty);
    }
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setCourses(filtered);
    setEnrolledCourses(mergedCourses.filter(c => c.enrollment));
    setCertificates(certsData || []);
    setBadges(badgesData || []);
    setLoading(false);
  }, [profile?.id, selectedCategory, selectedDifficulty, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEnroll = async (courseId: string) => {
    if (!profile?.id) return;

    const { error } = await supabase.from('course_enrollments').insert({
      user_id: profile.id,
      course_id: courseId,
      progress: 0,
      completed_lessons: [],
    });

    if (!error) {
      const course = courses.find(c => c.id === courseId);
      if (course && course.skills && course.skills.length > 0) {
        await supabase.from('skill_badges').insert({
          user_id: profile.id,
          skill_name: course.skills[0],
          level: 1,
          icon: categoryIcons[course.category]?.props.className || 'Award',
          color: categoryColors[course.category] || 'from-gray-500 to-gray-600',
        });
      }

      // Create a notification
      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'course',
        title: 'Course Enrollment',
        message: `You enrolled in ${course?.title}. Start learning now!`,
        link: '/dashboard/learning',
      });

      // Increment enrolled count
      if (course) {
        await supabase
          .from('courses')
          .update({ enrolled_count: (course.enrolled_count || 0) + 1 })
          .eq('id', courseId);
      }

      loadData();
    }
  };

  const openCoursePlayer = async (course: CourseWithEnrollment) => {
    if (!course.enrollment) {
      await handleEnroll(course.id);
      // Re-fetch to get the enrollment
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', profile?.id || '')
        .eq('course_id', course.id)
        .maybeSingle();

      if (enrollment) {
        course = { ...course, enrollment };
      }
    }

    setPlayerCourse(course);
    setPlayerLoading(true);
    setCompletedLessons(course.enrollment?.completed_lessons || []);
    setEnrollmentProgress(course.enrollment?.progress || 0);

    // Fetch modules and lessons
    const { data: modulesData } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', course.id)
      .order('order_index', { ascending: true });

    const { data: lessonsData } = await supabase
      .from('course_lessons')
      .select('*')
      .order('order_index', { ascending: true });

    const modules: Module[] = (modulesData || []).map(m => ({
      ...m,
      lessons: (lessonsData || []).filter(l => l.module_id === m.id).sort((a, b) => a.order_index - b.order_index),
    }));

    setPlayerModules(modules);

    // Set first lesson as current
    if (modules.length > 0 && modules[0].lessons.length > 0) {
      setCurrentModuleId(modules[0].id);
      setCurrentLesson(modules[0].lessons[0]);
    }

    setPlayerLoading(false);
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson || !playerCourse || !profile?.id) return;

    const newCompleted = [...new Set([...completedLessons, currentLesson.id])];
    setCompletedLessons(newCompleted);

    // Count total lessons
    const totalLessons = playerModules.reduce((sum, m) => sum + m.lessons.length, 0);
    const progress = Math.round((newCompleted.length / totalLessons) * 100);
    setEnrollmentProgress(progress);

    // Update enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', profile.id)
      .eq('course_id', playerCourse.id)
      .maybeSingle();

    if (enrollment) {
      const updateData: Record<string, unknown> = {
        progress,
        completed_lessons: newCompleted,
        updated_at: new Date().toISOString(),
      };

      if (progress === 100) {
        updateData.completed_at = new Date().toISOString();

        // Create certificate
        const { data: cert } = await supabase.from('certificates').insert({
          user_id: profile.id,
          course_id: playerCourse.id,
          certificate_number: `EARNIQ-${Date.now().toString(36).toUpperCase()}`,
        }).select('*').single();

        if (cert) {
          updateData.certificate_id = cert.id;
          setCertificates(prev => [...prev, cert]);

          // Notification
          await supabase.from('notifications').insert({
            user_id: profile.id,
            type: 'achievement',
            title: 'Course Completed!',
            message: `You completed ${playerCourse.title} and earned a certificate.`,
            link: '/dashboard/learning',
          });
        }
      }

      await supabase.from('course_enrollments').update(updateData).eq('id', enrollment.id);
    }

    // Auto-advance to next lesson
    goToNextLesson();
  };

  const goToNextLesson = () => {
    if (!currentLesson || !currentModuleId) return;

    const currentModule = playerModules.find(m => m.id === currentModuleId);
    if (!currentModule) return;

    const currentIdx = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIdx < currentModule.lessons.length - 1) {
      setCurrentLesson(currentModule.lessons[currentIdx + 1]);
      return;
    }

    // Move to next module
    const moduleIdx = playerModules.findIndex(m => m.id === currentModuleId);
    if (moduleIdx < playerModules.length - 1) {
      const nextModule = playerModules[moduleIdx + 1];
      if (nextModule.lessons.length > 0) {
        setCurrentModuleId(nextModule.id);
        setCurrentLesson(nextModule.lessons[0]);
      }
    }
  };

  const goToPrevLesson = () => {
    if (!currentLesson || !currentModuleId) return;

    const currentModule = playerModules.find(m => m.id === currentModuleId);
    if (!currentModule) return;

    const currentIdx = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIdx > 0) {
      setCurrentLesson(currentModule.lessons[currentIdx - 1]);
      return;
    }

    // Move to prev module's last lesson
    const moduleIdx = playerModules.findIndex(m => m.id === currentModuleId);
    if (moduleIdx > 0) {
      const prevModule = playerModules[moduleIdx - 1];
      if (prevModule.lessons.length > 0) {
        setCurrentModuleId(prevModule.id);
        setCurrentLesson(prevModule.lessons[prevModule.lessons.length - 1]);
      }
    }
  };

  const closePlayer = () => {
    setPlayerCourse(null);
    setPlayerModules([]);
    setCurrentLesson(null);
    setCurrentModuleId(null);
    loadData();
  };

  // Course Player View
  if (playerCourse) {
    const totalLessons = playerModules.reduce((sum, m) => sum + m.lessons.length, 0);
    const allLessons = playerModules.flatMap(m => m.lessons);
    const currentLessonIdx = allLessons.findIndex(l => l.id === currentLesson?.id);
    const isLastLesson = currentLessonIdx === allLessons.length - 1;
    const isLessonCompleted = currentLesson ? completedLessons.includes(currentLesson.id) : false;

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Player Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={closePlayer}
            className="flex items-center gap-2 text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Courses
          </button>
          <button
            onClick={closePlayer}
            className="p-2 text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Title & Progress */}
        <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${categoryColors[playerCourse.category] || 'from-primary-500 to-primary-700'} rounded-xl flex items-center justify-center text-white`}>
              {categoryIcons[playerCourse.category] || <BookOpen className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white">{playerCourse.title}</h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">{playerCourse.category}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  {completedLessons.length} of {totalLessons} lessons completed
                </span>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{enrollmentProgress}%</span>
              </div>
              <div className="h-2.5 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${enrollmentProgress}%` }}
                />
              </div>
            </div>
            {enrollmentProgress === 100 && (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium whitespace-nowrap">
                <Trophy className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar: Module List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 overflow-hidden sticky top-4">
              <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                <h3 className="font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-600" />
                  Course Content
                </h3>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {playerLoading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 bg-secondary-100 dark:bg-secondary-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  playerModules.map((module) => (
                    <div key={module.id} className="border-b border-secondary-100 dark:border-secondary-700/50 last:border-0">
                      <div className="px-4 py-3 bg-secondary-50 dark:bg-secondary-700/30">
                        <p className="text-sm font-semibold text-secondary-900 dark:text-white">
                          {playerModules.indexOf(module) + 1}. {module.title}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                          {module.lessons.length} lessons
                        </p>
                      </div>
                      {module.lessons.map((lesson) => {
                        const isCurrent = currentLesson?.id === lesson.id;
                        const isDone = completedLessons.includes(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setCurrentLesson(lesson);
                              setCurrentModuleId(module.id);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isCurrent
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                : 'hover:bg-secondary-50 dark:hover:bg-secondary-700/30 text-secondary-700 dark:text-secondary-300'
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : isCurrent ? (
                                <Play className="w-4 h-4 text-primary-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-secondary-300 dark:border-secondary-600" />
                              )}
                            </div>
                            <span className="text-sm flex-1 truncate">{lesson.title}</span>
                            <span className="text-xs text-secondary-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration_minutes}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main: Lesson Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
              {currentLesson ? (
                <>
                  {/* Lesson Header */}
                  <div className={`h-32 bg-gradient-to-br ${categoryColors[playerCourse.category] || 'from-primary-500 to-primary-700'} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-white/80" fill="currentColor" />
                    </div>
                  </div>

                  {/* Lesson Body */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400 mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      {currentLesson.duration_minutes} minutes
                      {currentLesson.has_quiz && (
                        <span className="ml-2 flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Target className="w-3.5 h-3.5" />
                          Has Quiz
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">{currentLesson.title}</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed whitespace-pre-line">
                        {currentLesson.content || 'Lesson content is being prepared. Please check back soon.'}
                      </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700">
                      <button
                        onClick={goToPrevLesson}
                        disabled={currentLessonIdx === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary-500 dark:text-secondary-400">
                          Lesson {currentLessonIdx + 1} of {totalLessons}
                        </span>
                      </div>

                      {isLastLesson && enrollmentProgress === 100 ? (
                        <button
                          onClick={closePlayer}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <Trophy className="w-4 h-4" />
                          Finish Course
                        </button>
                      ) : (
                        <button
                          onClick={handleCompleteLesson}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isLessonCompleted
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          {isLessonCompleted ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Completed
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Complete
                            </>
                          )}
                          {!isLastLesson && <ArrowRight className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">No lessons available</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">Lessons are being prepared for this course.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: BookOpen, label: ' Courses', value: courses.length },
    { icon: Trophy, label: 'Enrolled', value: enrolledCourses.length },
    { icon: Award, label: 'Certificates', value: certificates.length },
    { icon: Star, label: 'Badges', value: badges.length },
  ];

  const tabContent = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
                  <div className="h-40 bg-secondary-200 dark:bg-secondary-700"></div>
                  <div className="p-5">
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-secondary-200 dark:bg-secondary-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 overflow-hidden hover:shadow-xl transition-all group hover:-translate-y-1">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={course.thumbnail_url || `https://images.pexels.com/photos/${course.category === 'AI Prompt Engineering' ? '8386440' : '669615'}/pexels-photo-${course.category === 'AI Prompt Engineering' ? '8386440' : '669615'}.jpeg?auto=compress&cs=tinysrgb&w=400`}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${categoryColors[course.category] || 'from-primary-500 to-primary-600'} opacity-40`}></div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[course.difficulty]}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {course.rating?.toFixed(1) || '4.5'}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2 text-xs text-secondary-500 dark:text-secondary-400">
                      <span className="flex items-center gap-1">
                        {categoryIcons[course.category]}
                        {course.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-secondary-900 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration_hours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {course.lessons_count || 8} lessons
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrolled_count?.toLocaleString()}
                      </span>
                    </div>

                    {course.enrollment ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-secondary-600 dark:text-secondary-400">Progress</span>
                          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{course.enrollment.progress}%</span>
                        </div>
                        <div className="h-2 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                            style={{ width: `${course.enrollment.progress}%` }}
                          />
                        </div>
                        <button
                          onClick={() => openCoursePlayer(course)}
                          className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Continue Learning
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openCoursePlayer(course)}
                        className="w-full bg-white dark:bg-secondary-700 border-2 border-primary-600 text-primary-600 dark:text-primary-400 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Enroll Now - Free
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">No courses found</h3>
                <p className="text-secondary-600 dark:text-secondary-400">Try adjusting your filters</p>
              </div>
            )}
          </div>
        );

      case 'learning':
        return (
          <div className="space-y-6">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
                <div key={course.id} className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-32 md:h-auto relative overflow-hidden">
                      <img
                        src={course.thumbnail_url || `https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=200`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[course.category]} opacity-30`}></div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">{course.category}</span>
                          <h3 className="font-bold text-secondary-900 dark:text-white mb-1">{course.title}</h3>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">
                            {Math.round((course.enrollment?.progress || 0) / 100 * (course.lessons_count || 8))} of {course.lessons_count || 8} lessons completed
                          </p>
                        </div>
                        {course.enrollment?.progress === 100 && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            <Trophy className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="h-3 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                          style={{ width: `${course.enrollment?.progress || 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{course.enrollment?.progress || 0}% Complete</span>
                        <button
                          onClick={() => openCoursePlayer(course)}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          {course.enrollment?.progress === 100 ? 'Review Course' : 'Continue'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700">
                <BookOpen className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">Not enrolled in any courses yet</h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-4">Start your learning journey by enrolling in a course</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        );

      case 'certificates':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.length > 0 ? certificates.map((cert) => {
              const course = enrolledCourses.find(c => c.id === cert.course_id) || courses.find(c => c.id === cert.course_id);
              return (
                <div key={cert.id} className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl border border-primary-200 dark:border-primary-700 overflow-hidden">
                  <div className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-bold text-secondary-900 dark:text-white mb-1">{course?.title || 'Course Certificate'}</h3>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">Earned {new Date(cert.issued_at).toLocaleDateString()}</p>
                    <div className="text-xs text-secondary-400 dark:text-secondary-500 mb-4">Certificate ID: {cert.certificate_number}</div>
                    <button
                      onClick={() => {
                        const certText = `EARNIQ CERTIFICATE\n\nCourse: ${course?.title}\nCertificate ID: ${cert.certificate_number}\nIssued: ${new Date(cert.issued_at).toLocaleDateString()}\n\nThis certifies that the holder has successfully completed all requirements of the course.`;
                        const blob = new Blob([certText], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `EarnIQ-Certificate-${cert.certificate_number}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Certificate
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center py-12 bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700">
                <Award className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">No certificates yet</h3>
                <p className="text-secondary-600 dark:text-secondary-400">Complete a course to earn your first certificate</p>
              </div>
            )}
          </div>
        );

      case 'badges': {
        const allBadges = [
          { skill: 'Prompt Design', level: 1, icon: Brain, color: 'from-purple-500 to-indigo-600' },
          { skill: 'Data Entry', level: 2, icon: FileText, color: 'from-green-500 to-emerald-600' },
          { skill: 'Content Writing', level: 3, icon: BookOpen, color: 'from-amber-500 to-orange-600' },
          { skill: 'Translation', level: 1, icon: Globe, color: 'from-teal-500 to-green-600' },
        ];

        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allBadges.map((badge, i) => {
              const earned = badges.find(b => b.skill_name === badge.skill);
              const Icon = badge.icon;
              return (
                <div
                  key={i}
                  className={`relative rounded-2xl p-6 text-center ${
                    earned ? 'bg-white dark:bg-secondary-800 border border-primary-200 dark:border-primary-700' : 'bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700'
                  }`}
                >
                  {!earned && (
                    <div className="absolute inset-0 bg-secondary-200/50 dark:bg-secondary-700/50 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-secondary-400" />
                    </div>
                  )}
                  <div className={`w-16 h-16 bg-gradient-to-br ${badge.color} rounded-2xl flex items-center justify-center mx-auto mb-3 ${!earned ? 'opacity-50' : ''}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-secondary-900 dark:text-white text-sm mb-1">{badge.skill}</h4>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">Level {badge.level}</p>
                  {earned && (
                    <div className="flex justify-center mt-2">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < earned.level ? 'fill-amber-400 text-amber-400' : 'text-secondary-200 dark:text-secondary-600'}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-blue-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 p-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">AI Learning Hub</span>
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">Build in-demand skills with free courses and earn certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 flex items-center gap-3 hover:shadow-lg transition-all ${['border-l-4 border-emerald-400','border-l-4 border-amber-400','border-l-4 border-blue-400','border-l-4 border-pink-400'][i]}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${['bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400','bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400','bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400','bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'][i]}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {[
          { id: 'explore' as const, label: 'Explore Courses', icon: Target },
          { id: 'learning' as const, label: 'My Learning', icon: BookOpen },
          { id: 'certificates' as const, label: 'Certificates', icon: Award },
          { id: 'badges' as const, label: 'Skill Badges', icon: Trophy },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-600 border border-secondary-200 dark:border-secondary-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters (only show for explore tab) */}
      {activeTab === 'explore' && (
        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 dark:text-secondary-500" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-200 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 border border-secondary-200 dark:border-secondary-600 rounded-lg text-sm bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedDifficulty || ''}
              onChange={(e) => setSelectedDifficulty(e.target.value || null)}
              className="px-4 py-2 border border-secondary-200 dark:border-secondary-600 rounded-lg text-sm bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="pb-8">
        {tabContent()}
      </div>
    </div>
  );
}
