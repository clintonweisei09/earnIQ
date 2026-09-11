import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Users,
  Gift,
  Link,
  Copy,
  Check,
  Share2,
  Mail,
  Twitter,
  MessageCircle,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Referral, Profile } from '../../types/database';

type ReferralWithProfile = Referral & { referee?: Profile };

export default function Referrals() {
  const { profile, wallet } = useAuth();
  const [referrals, setReferrals] = useState<ReferralWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalReferred: 0,
    pendingRewards: 0,
    totalEarned: 0,
  });

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);

    const { data: referralsData } = await supabase
      .from('referrals')
      .select('*, referee:profiles!referrals_referee_id_fkey(*)')
      .eq('referrer_id', profile?.id || '')
      .order('created_at', { ascending: false });

    if (referralsData) {
      setReferrals(referralsData as ReferralWithProfile[]);

      const totalEarned = referralsData
        .filter(r => r.reward_status === 'paid')
        .reduce((sum, r) => sum + r.reward_amount, 0);

      const pendingRewards = referralsData
        .filter(r => r.reward_status === 'pending')
        .reduce((sum, r) => sum + r.reward_amount, 0);

      setStats({
        totalReferred: referralsData.length,
        pendingRewards,
        totalEarned,
      });
    }

    setLoading(false);
  };

  const referralLink = `${window.location.origin}/auth/signup?ref=${profile?.referral_code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform: 'twitter' | 'whatsapp' | 'email') => {
    const text = `Join me on EarnIQ Africa and start earning money by completing online tasks! Use my referral link:`;
    const url = referralLink;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      email: `mailto:?subject=${encodeURIComponent('Join EarnIQ Africa')}&body=${encodeURIComponent(text + '\n\n' + url)}`,
    };

    window.open(urls[platform], '_blank');
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    qualified: 'bg-blue-100 text-blue-700',
    rewarded: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const rewardStatusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-2">Referrals</h1>
        <p className="text-secondary-600">Invite friends and earn $5 for each successful referral</p>
      </div>

      {/* Referral Program Info */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Earn $5 per Referral</h2>
              <p className="text-primary-100">Share your unique link and earn when friends complete their first task</p>
            </div>
          </div>

          <div className="flex-1 lg:max-w-md">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2">
              <Link className="w-5 h-5 text-primary-200" />
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent text-white text-sm outline-none"
              />
              <button
                onClick={handleCopy}
                className="bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="bg-white border border-secondary-200 rounded-xl p-6">
        <h3 className="font-semibold text-secondary-900 mb-4">Share Your Link</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            <Twitter className="w-5 h-5" />
            Twitter
          </button>
          <button
            onClick={() => handleShare('email')}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-200 text-secondary-700 rounded-lg font-medium hover:bg-secondary-300 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Email
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-secondary-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Total Referrals</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalReferred}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Pending Rewards</p>
              <p className="text-2xl font-bold text-amber-600">${stats.pendingRewards.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">Total Earned</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalEarned.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white border border-secondary-200 rounded-xl p-6">
        <h3 className="font-semibold text-secondary-900 mb-6">How Referrals Work</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-secondary-900 mb-1">Share Your Link</h4>
            <p className="text-sm text-secondary-500">Send your unique referral link to friends</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-secondary-900 mb-1">Friend Signs Up</h4>
            <p className="text-sm text-secondary-500">They create a free account using your link</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-secondary-900 mb-1">Completes First Task</h4>
            <p className="text-sm text-secondary-500">Your friend completes their first paid task</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium text-secondary-900 mb-1">You Earn $5</h4>
            <p className="text-sm text-secondary-500">Reward credited to your wallet</p>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-secondary-100">
          <h3 className="font-semibold text-secondary-900">Your Referrals</h3>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-secondary-50 rounded-xl">
                <div className="w-10 h-10 bg-secondary-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-secondary-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : referrals.length > 0 ? (
          <div className="divide-y divide-secondary-100">
            {referrals.map((referral) => (
              <div key={referral.id} className="p-6 hover:bg-secondary-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">
                      {referral.referee?.full_name || referral.referee?.email || 'New User'}
                    </p>
                    <p className="text-sm text-secondary-500">
                      Joined {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-secondary-900">${referral.reward_amount.toFixed(2)}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rewardStatusColors[referral.reward_status]}`}>
                      {referral.reward_status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {referral.reward_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">No referrals yet</h3>
            <p className="text-secondary-600 mb-4">Share your link to start earning referral rewards</p>
            <button
              onClick={handleCopy}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Copy Referral Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
