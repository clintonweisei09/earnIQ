import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Sparkles,
  User,
  MapPin,
  Phone,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from 'lucide-react';

const AFRICAN_COUNTRIES = [
  'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Uganda', 'Tanzania', 'Ethiopia',
  'Rwanda', 'Cameroon', 'Côte d\'Ivoire', 'Senegal', 'Zimbabwe', 'Zambia',
  'Malawi', 'Mozambique', 'Angola', 'DR Congo', 'Morocco', 'Egypt', 'Tunisia',
  'Algeria', 'Libya', 'Sudan', 'Somalia', 'Burundi', 'Botswana', 'Namibia',
  'Lesotho', 'Eswatini', 'Gambia', 'Sierra Leone', 'Liberia', 'Guinea',
  'Mali', 'Burkina Faso', 'Niger', 'Chad', 'Central African Republic',
  'Congo', 'Gabon', 'Equatorial Guinea', 'Sao Tome and Principe', 'Benin', 'Togo',
];

const SKILLS = [
  'Data Annotation', 'Content Writing', 'Web Development', 'Mobile Development',
  'UI/UX Design', 'Digital Marketing', 'Data Analysis', 'Machine Learning',
  'Translation', 'Transcription', 'Video Editing', 'Graphic Design',
  'Project Management', 'Customer Support', 'Quality Assurance', 'Research',
];

export default function ProfileSetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    country: '',
    city: '',
    skills: [] as string[],
    bio: '',
  });
  const { updateProfile, profile } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const { error } = await updateProfile({
      ...formData,
      profile_completed: true,
      onboarding_completed: true,
    });

    if (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.full_name.trim().length >= 2;
      case 2:
        return formData.country && formData.phone;
      case 3:
        return formData.skills.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-transparent"></div>

      <div className="relative w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-secondary-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">
                Earn<span className="text-primary-600">IQ</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`w-10 h-2 rounded-full transition-colors ${
                    s <= step ? 'bg-primary-500' : 'bg-secondary-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm text-secondary-500 mb-1">Step {step} of 3</p>
            <h1 className="text-2xl font-bold text-secondary-900">
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Location & Contact'}
              {step === 3 && 'Select Your Skills'}
            </h1>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-secondary-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-secondary-700 mb-2">
                  Short Bio (optional)
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-secondary-700 mb-2">
                  Country
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none bg-white"
                  >
                    <option value="">Select your country</option>
                    {AFRICAN_COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-secondary-700 mb-2">
                  City (optional)
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
                <p className="mt-2 text-xs text-secondary-500">Used for M-Pesa withdrawals</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-secondary-600 mb-4">
                Select skills you have or want to learn (minimum 1)
              </p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.skills.includes(skill)
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                        : 'bg-secondary-50 text-secondary-600 border-2 border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 bg-white border border-secondary-200 text-secondary-700 py-3 px-4 rounded-lg font-medium hover:bg-secondary-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
