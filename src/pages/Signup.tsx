import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Music2, Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [gender, setGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [dataShareConsent, setDataShareConsent] = useState(false);

  const passwordRequirements = [
    { label: '1 letter', met: /[a-zA-Z]/.test(password) },
    { label: '1 number or special character (example: # ? ! &)', met: /[\d!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: '10 characters', met: password.length >= 10 },
  ];

  const allPasswordRequirementsMet = passwordRequirements.every(r => r.met);

  const handleNext = () => {
    if (step === 1 && email) {
      setStep(2);
    } else if (step === 2 && password && allPasswordRequirementsMet) {
      setStep(3);
    } else if (step === 3 && name && birthDate.day && birthDate.month && birthDate.year && gender) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await signup(email, password, name);
      toast({
        title: "Account created!",
        description: "Welcome to Spotify.",
      });
      navigate('/home');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spotify-dark flex flex-col">
      {/* Header */}
      <header className="p-8 flex justify-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="Spotify Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold">Spotify</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  s <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Sign up to start listening</h1>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="spotify-input w-full"
                />
              </div>

              <a href="#" className="block text-primary text-sm hover:underline">
                Use phone number instead
              </a>

              <button
                onClick={handleNext}
                disabled={!email}
                className="spotify-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-spotify-dark text-muted-foreground">or</span>
                </div>
              </div>

              {/* Social Signup */}
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-3 bg-transparent border border-muted-foreground text-foreground font-semibold py-3 px-4 rounded-full transition-all hover:border-foreground">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
                
                <button className="w-full flex items-center justify-center gap-3 bg-transparent border border-muted-foreground text-foreground font-semibold py-3 px-4 rounded-full transition-all hover:border-foreground">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  Sign up with Facebook
                </button>
              </div>

              <div className="text-center pt-4">
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-foreground underline hover:text-primary">
                    Log in here
                  </Link>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                ← Back
              </button>

              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Step 1 of 3</p>
                <h1 className="text-xl font-bold">Create a password</h1>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="spotify-input w-full pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Your password must contain at least</p>
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {req.met ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!allPasswordRequirementsMet}
                className="spotify-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground">
                ← Back
              </button>

              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Step 2 of 3</p>
                <h1 className="text-xl font-bold">Tell us about yourself</h1>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a profile name"
                  className="spotify-input w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">This appears on your profile.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Date of birth</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={birthDate.day}
                    onChange={(e) => setBirthDate({ ...birthDate, day: e.target.value })}
                    placeholder="DD"
                    maxLength={2}
                    className="spotify-input text-center"
                  />
                  <select
                    value={birthDate.month}
                    onChange={(e) => setBirthDate({ ...birthDate, month: e.target.value })}
                    className="spotify-input"
                  >
                    <option value="">Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={birthDate.year}
                    onChange={(e) => setBirthDate({ ...birthDate, year: e.target.value })}
                    placeholder="YYYY"
                    maxLength={4}
                    className="spotify-input text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {['Man', 'Woman', 'Non-binary', 'Something else', 'Prefer not to say'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm font-semibold transition-colors",
                        gender === g
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="marketing" className="text-sm">
                    I would prefer not to receive marketing messages from Spotify
                  </label>
                </div>
                
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="share"
                    checked={dataShareConsent}
                    onChange={(e) => setDataShareConsent(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="share" className="text-sm">
                    Share my registration data with Spotify's content providers for marketing purposes.
                  </label>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={isLoading || !name || !birthDate.day || !birthDate.month || !birthDate.year || !gender}
                className="spotify-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                By clicking on sign-up, you agree to Spotify's{' '}
                <a href="#" className="text-primary hover:underline">Terms and Conditions of Use</a>.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Signup;
