import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  Palette,
  Globe,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Settings() {
  const { profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    country: profile?.country || '',
    city: profile?.city || '',
    bio: profile?.bio || '',
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskUpdates: true,
    marketing: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');

    const { error: updateError } = await updateProfile({
      full_name: profileForm.full_name,
      phone: profileForm.phone,
      country: profileForm.country,
      city: profileForm.city,
      bio: profileForm.bio,
    });

    if (updateError) {
      setError(updateError);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (securityForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    setError('');

    const { error: authError } = await supabase.auth.updateUser({
      password: securityForm.newPassword,
    });

    if (authError) {
      setError(authError.message);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'preferences' as const, label: 'Preferences', icon: Palette },
  ];

  const AFRICAN_COUNTRIES = [
    'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Uganda', 'Tanzania', 'Ethiopia',
    'Rwanda', 'Cameroon', 'Côte d\'Ivoire', 'Senegal', 'Zimbabwe', 'Zambia',
    'Malawi', 'Mozambique', 'Angola', 'DR Congo', 'Morocco', 'Egypt', 'Tunisia',
    'Algeria', 'Libya', 'Sudan', 'Somalia',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-2">Settings</h1>
        <p className="text-secondary-600">Manage your account settings and preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">Changes saved successfully!</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-secondary-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-secondary-200 rounded-xl p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-secondary-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-secondary-50 transition-colors">
                <Camera className="w-4 h-4 text-secondary-600" />
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 mb-1">{profile?.full_name || 'Your Name'}</h3>
              <p className="text-sm text-secondary-500">{profile?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                {profile?.user_type || 'worker'}
              </span>
            </div>
          </div>

          <hr className="border-secondary-200" />

          {/* Form */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg bg-secondary-50 text-secondary-500"
                />
              </div>
              <p className="mt-1 text-xs text-secondary-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+254 7XX XXX XXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Country
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <select
                  value={profileForm.country}
                  onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                >
                  <option value="">Select country</option>
                  {AFRICAN_COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Your city"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Bio
            </label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white border border-secondary-200 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900">Change Password</h3>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving || !securityForm.newPassword || !securityForm.confirmPassword}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-secondary-200 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900">Notification Preferences</h3>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', description: 'Receive task updates and earnings notifications via email' },
              { key: 'push', label: 'Push Notifications', description: 'Get instant alerts on your browser' },
              { key: 'taskUpdates', label: 'Task Updates', description: 'Get notified when your tasks are approved or rejected' },
              { key: 'marketing', label: 'Marketing Emails', description: 'Receive promotional offers and news' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">{item.label}</p>
                  <p className="text-sm text-secondary-500">{item.description}</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications[item.key as keyof typeof notifications] ? 'bg-primary-600' : 'bg-secondary-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white border border-secondary-200 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-secondary-900">Preferences</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Language
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <select className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white">
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Currency Display
              </label>
              <select className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white">
                <option value="usd">USD ($)</option>
                <option value="kes">KES (KSh)</option>
                <option value="ngn">NGN (₦)</option>
                <option value="ghs">GHS (GH₵)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Theme
              </label>
              <select className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
