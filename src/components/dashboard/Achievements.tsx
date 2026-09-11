import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Crown,
  Medal,
  Flame,
  CheckCircle2,
  Lock,
  Gift,
  TrendingUp,
  Brain,
  Briefcase,
  Wallet,
  Users,
  Clock,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  requirement: string;
  reward: string;
  progress?: number;
  total?: number;
  unlocked: boolean;
  unlockedAt?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const achievements: Achievement[] = [
  {
    id: 'first-task',
    title: 'First Steps',
    description: 'Complete your first task successfully',
    icon: <Zap className="w-6 h-6" />,
    requirement: 'Complete 1 task',
    reward: '$5 bonus',
    progress: 1,
    total: 1,
    unlocked: true,
    unlockedAt: '2 days ago',
    tier: 'bronze',
  },
  {
    id: 'ten-tasks',
    title: 'Getting Started',
    description: 'Complete 10 tasks on the platform',
    icon: <Target className="w-6 h-6" />,
    requirement: 'Complete 10 tasks',
    reward: '$15 bonus',
    progress: 7,
    total: 10,
    unlocked: false,
    tier: 'bronze',
  },
  {
    id: 'fifty-tasks',
    title: 'Dedicated Worker',
    description: 'Reach 50 completed tasks',
    icon: <Briefcase className="w-6 h-6" />,
    requirement: 'Complete 50 tasks',
    reward: '$50 bonus',
    progress: 7,
    total: 50,
    unlocked: false,
    tier: 'silver',
  },
  {
    id: 'hundred-tasks',
    title: 'Task Master',
    description: 'Complete 100 tasks successfully',
    icon: <Award className="w-6 h-6" />,
    requirement: 'Complete 100 tasks',
    reward: '$100 bonus',
    progress: 7,
    total: 100,
    unlocked: false,
    tier: 'gold',
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day work streak',
    icon: <Flame className="w-6 h-6" />,
    requirement: '7 day streak',
    reward: '$10 bonus',
    progress: 3,
    total: 7,
    unlocked: false,
    tier: 'bronze',
  },
  {
    id: 'streak-30',
    title: 'Monthly Champion',
    description: 'Maintain a 30-day work streak',
    icon: <Crown className="w-6 h-6" />,
    requirement: '30 day streak',
    reward: '$100 bonus',
    progress: 3,
    total: 30,
    unlocked: false,
    tier: 'platinum',
  },
  {
    id: 'earnings-100',
    title: 'Century Earner',
    description: 'Earn $100 total on the platform',
    icon: <Wallet className="w-6 h-6" />,
    requirement: '$100 total earnings',
    reward: '$20 bonus',
    progress: 47,
    total: 100,
    unlocked: false,
    tier: 'silver',
  },
  {
    id: 'earnings-500',
    title: 'Half Way',
    description: 'Reach $500 in total earnings',
    icon: <TrendingUp className="w-6 h-6" />,
    requirement: '$500 total earnings',
    reward: '$75 bonus',
    progress: 47,
    total: 500,
    unlocked: false,
    tier: 'gold',
  },
  {
    id: 'earnings-1000',
    title: 'Thousand Club',
    description: 'Earn $1,000 total on the platform',
    icon: <Star className="w-6 h-6" />,
    requirement: '$1000 total earnings',
    reward: '$200 bonus',
    progress: 47,
    total: 1000,
    unlocked: false,
    tier: 'platinum',
  },
  {
    id: 'referral-5',
    title: 'Social Starter',
    description: 'Invite 5 friends who activate',
    icon: <Users className="w-6 h-6" />,
    requirement: '5 active referrals',
    reward: '$25 bonus',
    progress: 2,
    total: 5,
    unlocked: false,
    tier: 'bronze',
  },
  {
    id: 'referral-25',
    title: 'Community Builder',
    description: 'Invite 25 friends to the platform',
    icon: <Users className="w-6 h-6" />,
    requirement: '25 active referrals',
    reward: '$150 bonus',
    progress: 2,
    total: 25,
    unlocked: false,
    tier: 'gold',
  },
  {
    id: 'quality-100',
    title: 'Perfectionist',
    description: 'Complete 10 tasks with 100% quality',
    icon: <CheckCircle2 className="w-6 h-6" />,
    requirement: '10 perfect tasks',
    reward: '$50 bonus',
    progress: 4,
    total: 10,
    unlocked: false,
    tier: 'gold',
  },
];

const tierColors = {
  bronze: 'from-amber-600 to-amber-700',
  silver: 'from-gray-400 to-gray-500',
  gold: 'from-yellow-400 to-amber-500',
  platinum: 'from-purple-400 to-indigo-500',
};

const tierBgColors = {
  bronze: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  silver: 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-600',
  gold: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
  platinum: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
};

export default function Achievements() {
  const { profile } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalRewards = achievements.filter(a => a.unlocked).reduce((sum, a) => {
    const reward = parseInt(a.reward.replace(/[^0-9]/g, ''));
    return sum + reward;
  }, 0);

  const filteredAchievements = selectedTier
    ? achievements.filter(a => a.tier === selectedTier)
    : achievements;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 dark:text-white mb-2">Achievements</h1>
        <p className="text-secondary-600 dark:text-secondary-400">Complete challenges to earn badges and bonus rewards</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{unlockedCount}</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Unlocked</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">${totalRewards}</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Earned</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">3</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Day Streak</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{achievements.length}</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tiers */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTier(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !selectedTier
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-300 dark:border-primary-700'
              : 'bg-secondary-50 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-600'
          }`}
        >
          All
        </button>
        {(['bronze', 'silver', 'gold', 'platinum'] as const).map(tier => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              selectedTier === tier
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-300 dark:border-primary-700'
                : 'bg-secondary-50 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-600'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Unlocked Section */}
      {!selectedTier && unlockedCount > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary-600" />
            Recently Unlocked
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.filter(a => a.unlocked).map(achievement => (
              <div
                key={achievement.id}
                className={`rounded-xl border-2 ${tierBgColors[achievement.tier]} p-4`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${tierColors[achievement.tier]} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-secondary-900 dark:text-white">{achievement.title}</h3>
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{achievement.reward}</span>
                      <span className="text-xs text-secondary-500 dark:text-secondary-500">Unlocked {achievement.unlockedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Achievements */}
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
          {selectedTier ? `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Achievements` : 'All Achievements'}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {filteredAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`rounded-xl border ${
                achievement.unlocked
                  ? `${tierBgColors[achievement.tier]} border-2`
                  : 'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700'
              } p-4 ${!achievement.unlocked ? 'opacity-80' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  achievement.unlocked
                    ? `bg-gradient-to-br ${tierColors[achievement.tier]} text-white shadow-lg`
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-400 dark:text-secondary-500'
                }`}>
                  {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-secondary-900 dark:text-white">{achievement.title}</h3>
                    {achievement.unlocked && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />}
                  </div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">{achievement.description}</p>

                  {/* Progress Bar */}
                  {achievement.total && !achievement.unlocked && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-secondary-500 dark:text-secondary-400 mb-1">
                        <span>{achievement.progress} / {achievement.total}</span>
                        <span>{Math.round((achievement.progress / achievement.total) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-secondary-200 dark:bg-secondary-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${tierColors[achievement.tier]} rounded-full transition-all duration-500`}
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${achievement.unlocked ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400'}`}>
                      {achievement.reward}
                    </span>
                    <span className="text-xs text-secondary-500 dark:text-secondary-500 capitalize px-2 py-0.5 bg-secondary-100 dark:bg-secondary-700 rounded">
                      {achievement.tier}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reward Tiers Info */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Achievement Tiers</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center mb-2 shadow">
              <Medal className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold">Bronze</p>
            <p className="text-sm text-primary-200">Beginner challenges</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center mb-2 shadow">
              <Medal className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold">Silver</p>
            <p className="text-sm text-primary-200">Intermediate goals</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center mb-2 shadow">
              <Medal className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold">Gold</p>
            <p className="text-sm text-primary-200">Advanced milestones</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center mb-2 shadow">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold">Platinum</p>
            <p className="text-sm text-primary-200">Elite achievements</p>
          </div>
        </div>
      </div>
    </div>
  );
}
