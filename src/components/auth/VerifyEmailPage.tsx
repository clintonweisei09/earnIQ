import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Sparkles,
  Mail,
  ArrowLeft,
  CheckCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const email = location.state?.email || user?.email;

  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleResend = async () => {
    setResending(true);
    // In a real app, this would call Supabase to resend verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-transparent"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-secondary-100 p-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900">
              Earn<span className="text-primary-600">IQ</span>
            </span>
          </Link>

          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary-600" />
          </div>

          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Verify your email</h1>
          <p className="text-secondary-600 mb-6">
            We've sent a verification link to
            <br />
            <strong className="text-secondary-900">{email}</strong>
          </p>

          <div className="bg-secondary-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="text-left text-sm text-secondary-600">
                <p className="font-medium text-secondary-900 mb-1">Check your inbox</p>
                <p>Click the link in the email to verify your account. The link expires in 24 hours.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resending || resent}
              className="w-full bg-white border border-secondary-200 text-secondary-700 py-3 px-4 rounded-lg font-medium hover:bg-secondary-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : resent ? (
                <>
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                  Email sent!
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Resend verification email
                </>
              )}
            </button>

            <Link
              to="/auth/signup"
              className="block w-full text-secondary-600 py-3 px-4 rounded-lg font-medium hover:bg-secondary-50 transition-colors"
            >
              Use a different email
            </Link>
          </div>

          <p className="mt-8 text-sm text-secondary-500">
            Already verified?{' '}
            <Link to="/auth/login" className="text-primary-600 font-medium hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-secondary-600 hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
