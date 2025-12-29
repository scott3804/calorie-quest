import { useAuth } from "./hooks/useAuth";
import { OnboardingWizard } from "./components/Onboarding/OnboardingWizard";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { signInWithGoogle } from "./firebase"; // 1. IMPORT THIS

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">
          CalorieQuest
        </h1>
        <button
          onClick={async () => {
            try {
              await signInWithGoogle(); // 2. CALL THIS
            } catch (error) {
              console.error("Login failed:", error);
              alert(
                "Failed to sign in. Make sure Google Auth is enabled in Firebase!"
              );
            }
          }}
          className="bg-white border border-slate-200 px-8 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-3 hover:bg-slate-50 active:scale-95 transition-all text-slate-700"
        >
          {/* Use a clearer Google G Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!profile) {
    return <OnboardingWizard />;
  }

  return (
    <div className="App">
      <Dashboard profile={profile} />
    </div>
  );
}

export default App;
