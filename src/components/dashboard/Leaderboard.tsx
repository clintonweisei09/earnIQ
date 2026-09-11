import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Star,
  Zap,
  Target,
  Award,
  ChevronUp,
  ChevronDown,
  Flame,
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  country: string;
  avatar?: string;
  earnings: number;
  tasksCompleted: number;
  streak: number;
  badge: 'gold' | 'silver' | 'bronze' | null;
  change: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: 'Amara Diallo', country: 'Senegal', earnings: 2847.50, tasksCompleted: 312, streak: 45, badge: 'gold', change: 0 },
  { rank: 2, name: 'Kwesi Mensah', country: 'Ghana', earnings: 2456.80, tasksCompleted: 287, streak: 32, badge: 'silver', change: 2 },
  { rank: 3, name: 'Fatima Okonkwo', country: 'Nigeria', earnings: 2389.20, tasksCompleted: 274, streak: 28, badge: 'bronze', change: -1 },
  { rank: 4, name: 'Abebe Tesfaye', country: 'Ethiopia', earnings: 2134.70, tasksCompleted: 251, streak: 41, badge: null, change: 1 },
  { rank: 5, name: 'Grace Mwangi', country: 'Kenya', earnings: 1987.40, tasksCompleted: 234, streak: 19, badge: null, change: -2 },
  { rank: 6, name: 'Yusuf Hassan', country: 'Uganda', earnings: 1856.30, tasksCompleted: 218, streak: 24, badge: null, change: 3 },
  { rank: 7, name: 'Aisha Bello', country: 'Nigeria', earnings: 1756.90, tasksCompleted: 205, streak: 15, badge: null, change: 0 },
  { rank: 8, name: 'David Osei', country: 'Ghana', earnings: 1687.20, tasksCompleted: 196, streak: 22, badge: null, change: -1 },
  { rank: 9, name: 'Mariama Conteh', country: 'Sierra Leone', earnings: 1598.50, tasksCompleted: 187, streak: 11, badge: null, change: 2 },
  { rank: 10, name: 'John Mensah', country: 'Ghana', earnings: 1523.80, tasksCompleted: 178, streak: 18, badge: null, change: 1 },
];

const timeRanges = ['This Week', 'This Month', 'All Time'];
const categories = ['Earnings', 'Tasks Completed', 'Streak'];

export default function Leaderboard() {
  const { profile } = useAuth();
  const [selectedRange, setSelectedRange] = useState('This Week');
  const [selectedCategory, setSelectedCategory] = useState('Earnings');

  const getBadgeIcon = (badge: 'gold' | 'silver' | 'bronze' | null) => {
    if (badge === 'gold') return <Crown className="w-5 h-5 text-yellow-500" />;
    if (badge === 'silver') return <Medal className="w-5 h-5 text-gray-400" />;
    if (badge === 'bronze') return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getBadgeColor = (badge: 'gold' | 'silver' | 'bronze' | null) => {
    if (badge === 'gold') return 'from-yellow-400 to-amber-500';
    if (badge === 'silver') return 'from-gray-300 to-gray-400';
    if (badge === 'bronze') return 'from-amber-500 to-amber-600';
    return '';
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700';
    if (rank === 2) return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 border-gray-300 dark:border-gray-600';
    if (rank === 3) return 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-300 dark:border-amber-700';
    return 'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl mb-4 shadow-lg">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 dark:text-white mb-2">Leaderboard</h1>
        <p className="text-secondary-600 dark:text-secondary-400">See top performers and compete for rewards</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            {timeRanges.map(range => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRange === range
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-300 dark:border-primary-700'
                    : 'bg-secondary-50 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-300 dark:border-primary-700'
                    : 'bg-secondary-50 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* 2nd Place */}
        <div className="order-2 md:order-1 md:mt-8">
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800/50 dark:to-gray-700/30 rounded-2xl p-6 text-center border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gray-200/50 dark:bg-gray-600/30 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-3 shadow-lg">
                <Medal className="w-8 h-8 text-white" />
              </div>
              <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto mb-2"></div>
              <h3 className="font-bold text-secondary-900 dark:text-white mb-1">{leaderboardData[1]?.name}</h3>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">{leaderboardData[1]?.country}</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">${leaderboardData[1]?.earnings.toFixed(2)}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">{leaderboardData[1]?.tasksCompleted} tasks</p>
            </div>
          </div>
        </div>

        {/* 1st Place */}
        <div className="order-1 md:order-2">
          <div className="bg-gradient-to-br from-yellow-100 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/20 rounded-2xl p-6 text-center border-2 border-yellow-300 dark:border-yellow-700 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-300/30 dark:bg-yellow-600/20 rounded-full -translate-y-1/2" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mb-3 shadow-xl">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
              <h3 className="font-bold text-lg text-secondary-900 dark:text-white mb-1">{leaderboardData[0]?.name}</h3>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">{leaderboardData[0]?.country}</p>
              <p className="text-3xl font-bold text-secondary-900 dark:text-white">${leaderboardData[0]?.earnings.toFixed(2)}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">{leaderboardData[0]?.tasksCompleted} tasks</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{leaderboardData[0]?.streak} day streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="order-3 md:mt-12">
          <div className="bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl p-6 text-center border-2 border-amber-300 dark:border-amber-700 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-200/50 dark:bg-amber-700/20 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-2"></div>
              <h3 className="font-bold text-secondary-900 dark:text-white mb-1">{leaderboardData[2]?.name}</h3>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">{leaderboardData[2]?.country}</p>
              <p className="text-xl font-bold text-secondary-900 dark:text-white">${leaderboardData[2]?.earnings.toFixed(2)}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">{leaderboardData[2]?.tasksCompleted} tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Position */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl border border-primary-200 dark:border-primary-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-secondary-900 dark:text-white">{profile?.full_name || 'Your Name'}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Your Position</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">#42</p>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm font-medium">+5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 dark:bg-secondary-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Tasks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Streak</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {leaderboardData.map((entry) => (
                <tr key={entry.rank} className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {entry.badge && getBadgeIcon(entry.badge)}
                      <span className={`font-bold ${entry.badge ? 'text-secondary-900 dark:text-white' : 'text-secondary-600 dark:text-secondary-400'}`}>
                        {entry.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${entry.badge ? `bg-gradient-to-br ${getBadgeColor(entry.badge)}` : 'bg-secondary-300 dark:bg-secondary-600'}`}>
                        {entry.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-white">{entry.name}</p>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">{entry.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-primary-600 dark:text-primary-400">${entry.earnings.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-secondary-900 dark:text-white font-medium">{entry.tasksCompleted}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-secondary-900 dark:text-white">{entry.streak}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {entry.change > 0 ? (
                      <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                        <ChevronUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{entry.change}</span>
                      </div>
                    ) : entry.change < 0 ? (
                      <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                        <ChevronDown className="w-4 h-4" />
                        <span className="text-sm font-medium">{Math.abs(entry.change)}</span>
                      </div>
                    ) : (
                      <span className="text-secondary-400 dark:text-secondary-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Rewards */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Weekly Rewards</h3>
            <p className="text-primary-100 text-sm mb-4">Top performers each week earn bonus rewards!</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-xs text-primary-200">1st Place</p>
                <p className="text-lg font-bold">$50</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-xs text-primary-200">2nd Place</p>
                <p className="text-lg font-bold">$30</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-xs text-primary-200">3rd Place</p>
                <p className="text-lg font-bold">$20</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Gift } from 'lucide-react';
