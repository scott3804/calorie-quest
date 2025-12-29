import { useAuth } from "./hooks/useAuth";
import { OnboardingWizard } from "./components/Onboarding/OnboardingWizard";
import { Dashboard } from "./components/Dashboard/Dashboard"; // We'll build the HUD version next

function App() {
  const { user, profile, loading } = useAuth();

  // 1. Show a loading spinner or splash screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 2. If no user is logged in, show Login (we'll build a simple Google button for this)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <h1 className="text-4xl font-black text-slate-900 mb-8">
          CalorieQuest
        </h1>
        <button
          onClick={() => {
            /* We will add signInWithGoogle here */
          }}
          className="bg-white border border-slate-200 px-8 py-4 rounded-2xl shadow-sm font-bold flex items-center gap-3 hover:bg-slate-50 transition-colors"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg"
            width="20"
            alt="Google"
          />
          Sign in with Google
        </button>
      </div>
    );
  }

  // 3. If user exists but has no profile, start Onboarding
  if (!profile) {
    return <OnboardingWizard />;
  }

  // 4. Returning user with a profile goes to the HUD
  return (
    <div className="App">
      <Dashboard profile={profile} />
    </div>
  );
}

export default App;
