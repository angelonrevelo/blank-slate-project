import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppState } from '@/context/AppContext';
import { Button, Input, Checkbox, Modal } from '@/components/ui';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, loading } = useAuth();
  const { remLogin, setRemLogin, setLoginBranch, loginBranch } = useAppState();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Password reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Rate limiting state
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Check for existing lockout on mount
  useState(() => {
    const lockoutEnd = localStorage.getItem('loginLockoutEnd');
    if (lockoutEnd) {
      const end = parseInt(lockoutEnd);
      if (Date.now() < end) {
        setIsLocked(true);
        setLockoutTime(end);
      } else {
        localStorage.removeItem('loginLockoutEnd');
        localStorage.removeItem('loginAttempts');
      }
    }
  });

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if locked out
    if (isLocked && lockoutTime) {
      const remaining = Math.ceil((lockoutTime - Date.now()) / 60000);
      setError(`Too many failed attempts. Please try again in ${remaining} minute(s).`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        // Sign up mode
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsSubmitting(false);
          return;
        }
        await signUp(email, password);
        setSignUpSuccess(true);
        // Clear any failed attempts on successful signup
        localStorage.removeItem('loginAttempts');
      } else {
        // Sign in mode
        await signIn(email, password);
        // Clear failed attempts on successful login
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginLockoutEnd');
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : isSignUp ? 'Failed to sign up' : 'Failed to sign in';
      setError(errorMessage);

      // Track failed login attempts (only for sign in)
      if (!isSignUp) {
        const attempts = parseInt(localStorage.getItem('loginAttempts') || '0') + 1;
        localStorage.setItem('loginAttempts', attempts.toString());

        if (attempts >= 5) {
          // Lock out for 15 minutes
          const lockEnd = Date.now() + 15 * 60 * 1000;
          localStorage.setItem('loginLockoutEnd', lockEnd.toString());
          setIsLocked(true);
          setLockoutTime(lockEnd);
          setError('Too many failed attempts. Account locked for 15 minutes.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetError('');
    setIsResetting(true);

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsResetting(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetSuccess(false);
    setResetError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Logo */}
      <div className="mb-6 animate-scale-in">
        <img
          src="/images/LogoTitle2_VBE.png"
          alt="VBE Eye Center"
          className="w-[180px] h-auto object-contain"
        />
      </div>

      {/* Branch Selector */}
      {!isSignUp && !signUpSuccess && (
        <div className="mb-4 animate-slide-up flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setLoginBranch('Quezon')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              loginBranch === 'Quezon'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Quezon City
          </button>
          <button
            type="button"
            onClick={() => setLoginBranch('Tanauan')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              loginBranch === 'Tanauan'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tanauan City
          </button>
        </div>
      )}

      {/* Welcome text */}
      <div className="text-center mb-5 animate-slide-up">
        <h1 className="text-xl font-semibold text-foreground mb-1">
          {isSignUp ? 'Create Account' : 'Welcome'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp ? 'Sign up to get started.' : 'Please sign in to continue.'}
        </p>
      </div>

      {/* Success message for signup */}
      {signUpSuccess ? (
        <div className="w-full max-w-[400px] animate-slide-up">
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-lg mb-4">
            <p className="font-semibold mb-1">Account created successfully!</p>
            <p>You can now sign in with your credentials.</p>
          </div>
          <Button
            onClick={() => {
              setIsSignUp(false);
              setSignUpSuccess(false);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            fullWidth
          >
            Go to Sign In
          </Button>
        </div>
      ) : (
        <form 
          onSubmit={handleSubmit} 
          className="w-full max-w-[400px] space-y-3.5 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          {error && (
            <div className="bg-red-50 text-error text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            showPasswordToggle
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          {isSignUp && (
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              showPasswordToggle
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
          )}

          {!isSignUp && (
            <div className="flex items-center justify-between">
              <Checkbox
                id="rememberLogin"
                label="Remember me"
                checked={remLogin}
                onChange={(e) => setRemLogin(e.target.checked)}
              />
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting || loading}
            size="lg"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      )}

      {/* Password Reset Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={closeResetModal}
        title="Reset Password"
        size="sm"
      >
        {resetSuccess ? (
          <div className="text-center py-4">
            <div className="mb-4 text-success">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="text-gray-700 mb-4">
              Password reset email has been sent. Please check your inbox.
            </p>
            <Button onClick={closeResetModal} fullWidth>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetError && (
              <div className="bg-red-50 text-error text-sm p-3 rounded-lg">
                {resetError}
              </div>
            )}

            <Input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              fullWidth
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={closeResetModal}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isResetting}
                fullWidth
              >
                Send Reset Link
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Please ask an administrator if you forgot the default password.
            </p>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default LoginPage;