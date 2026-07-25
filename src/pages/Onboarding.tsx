import { useNavigate } from 'react-router-dom';
import { Music2 } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-dark-elevated to-spotify-black flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-foreground rounded-full flex items-center justify-center">
            <Music2 className="h-6 w-6 text-background" />
          </div>
          <span className="text-2xl font-bold">Spotify</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="max-w-md space-y-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Millions of songs.
            <br />
            Free on Spotify.
          </h1>
          
          <div className="space-y-3 pt-4">
            <button
              onClick={() => navigate('/signup')}
              className="spotify-button-primary w-full"
            >
              Sign up free
            </button>
            
            <button
              onClick={() => navigate('/signup')}
              className="w-full flex items-center justify-center gap-3 bg-transparent border border-muted-foreground text-foreground font-bold py-3 px-8 rounded-full transition-all duration-200 hover:border-foreground"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            
            <button
              onClick={() => navigate('/signup')}
              className="w-full flex items-center justify-center gap-3 bg-transparent border border-muted-foreground text-foreground font-bold py-3 px-8 rounded-full transition-all duration-200 hover:border-foreground"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              Continue with Facebook
            </button>
            
            <button
              onClick={() => navigate('/signup')}
              className="w-full flex items-center justify-center gap-3 bg-transparent border border-muted-foreground text-foreground font-bold py-3 px-8 rounded-full transition-all duration-200 hover:border-foreground"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>
          </div>
          
          <div className="pt-4">
            <button
              onClick={() => navigate('/login')}
              className="text-muted-foreground font-semibold hover:text-foreground transition-colors"
            >
              Log in
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-muted-foreground">
        <p>
          This site is protected by reCAPTCHA and the Google{' '}
          <a href="#" className="underline">Privacy Policy</a> and{' '}
          <a href="#" className="underline">Terms of Service</a> apply.
        </p>
      </footer>
    </div>
  );
};

export default Onboarding;
