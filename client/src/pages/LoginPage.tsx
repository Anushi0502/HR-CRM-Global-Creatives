import type { CSSProperties, FormEvent } from "react";
import { useMemo, useState } from "react";
import { ArrowRight, Github, LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";
import type { AuthResult } from "../hooks/useAuthSession";
import { BrandLogo } from "../components/BrandLogo";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<AuthResult>;
  onSignup: (name: string, email: string, password: string) => Promise<AuthResult>;
  onGithubSignIn: () => Promise<AuthResult>;
  onGoogleSignIn: () => Promise<AuthResult>;
  isSupabaseConfigured: boolean;
}

type AuthMode = "login" | "signup";

function getPasswordStrength(value: string): { label: string; score: number; tone: string } {
  const lengthScore = Math.min(value.length / 12, 1);
  const hasNumber = /\d/.test(value) ? 0.2 : 0;
  const hasUpper = /[A-Z]/.test(value) ? 0.2 : 0;
  const hasSpecial = /[^A-Za-z0-9]/.test(value) ? 0.2 : 0;
  const score = Math.min(lengthScore + hasNumber + hasUpper + hasSpecial, 1);

  if (score < 0.4) {
    return { label: "Weak", score, tone: "bg-rose-500" };
  }

  if (score < 0.75) {
    return { label: "Medium", score, tone: "bg-amber-500" };
  }

  return { label: "Strong", score, tone: "bg-emerald-500" };
}

export function LoginPage({
  onLogin,
  onSignup,
  onGithubSignIn,
  onGoogleSignIn,
  isSupabaseConfigured,
}: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>(() => {
    if (typeof window === "undefined") {
      return "login";
    }
    const stored = window.localStorage.getItem("hrcrm_auth_mode");
    return stored === "signup" ? "signup" : "login";
  });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const passwordStrength = useMemo(() => getPasswordStrength(signupPassword), [signupPassword]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const result = await onLogin(loginEmail.trim(), loginPassword.trim());

      if (!result.success) {
        setError(result.message ?? "Invalid credentials. Use your registered account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSignup(signupName.trim(), signupEmail.trim(), signupPassword);

      if (!result.success) {
        setError(result.message ?? "Unable to create account.");
        return;
      }

      if (result.message) {
        setInfo(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const result = await onGoogleSignIn();

      if (!result.success) {
        setError(result.message ?? "Google sign-in failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const result = await onGithubSignIn();

      if (!result.success) {
        setError(result.message ?? "GitHub sign-in failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen animate-page-enter items-center justify-center overflow-hidden bg-transparent px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_70%_45%,rgba(56,189,248,0.35),transparent_70%),radial-gradient(1000px_520px_at_18%_18%,rgba(14,116,255,0.28),transparent_65%),radial-gradient(900px_540px_at_85%_80%,rgba(59,130,246,0.22),transparent_72%)]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "140px 140px",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(rgba(125,211,252,0.55) 1px, transparent 1px)",
            backgroundSize: "240px 240px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[radial-gradient(120%_90%_at_50%_100%,rgba(59,130,246,0.45),transparent_70%)]" />
      </div>
      <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/15 bg-slate-950/45 shadow-[0_40px_140px_-60px_rgba(2,8,23,0.9)] backdrop-blur-2xl">
        <section
          className="login-panel p-5 text-white sm:p-8 lg:p-10"
          style={{ backgroundImage: "var(--login-panel-gradient)" }}
        >
          <div className="grid items-stretch gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <aside className="relative flex h-full min-h-full flex-col justify-between gap-10 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.35),rgba(2,6,23,0.35))] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-7">
              <div className="flex-1 space-y-6">
                <div className="relative w-full">
                  <div className="absolute -inset-6 -z-10 rounded-[36px] bg-[radial-gradient(60%_60%_at_40%_40%,rgba(56,189,248,0.35),transparent_70%)] blur-2xl" />
                  <div className="relative flex w-full items-center justify-center rounded-[28px] border border-white/20 bg-[linear-gradient(90deg,#1d4ed8_0%,#38bdf8_100%)] px-6 py-4 shadow-[0_24px_60px_-40px_rgba(56,189,248,0.9)] min-h-[84px] sm:min-h-[96px]">
                    <BrandLogo variant="plain" size="4xl" className="drop-shadow-[0_10px_30px_rgba(2,8,23,0.55)]" />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[0.8rem] font-black uppercase tracking-[0.28em] text-sky-100">
                    Workspace Access
                  </p>
                  <h1 className="font-display text-[3.6rem] font-extrabold leading-[1.04] text-white sm:text-[4.1rem]">
                    {mode === "login" ? "Access your workspace" : "Create your workspace account"}
                  </h1>
                  <p className="max-w-md text-lg leading-relaxed text-white/90">
                    {mode === "login"
                      ? "Use your approved credentials or connected provider to enter the HR CRM."
                      : "Register once, then continue into the role-aware HR workspace with secure access."}
                  </p>
                </div>

                <div className="flex flex-nowrap items-center gap-2 text-[0.72rem] font-black uppercase tracking-[0.18em] text-white/90">
                  {["Admin + Employee", "OAuth Ready", "Role-Aware"].map((item) => (
                    <span
                      key={item}
                      className="whitespace-nowrap rounded-full border border-white/12 bg-white/6 px-2.5 py-1"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="h-px w-full rounded-full bg-gradient-to-r from-sky-300/60 via-transparent to-transparent" />
            </aside>

            <div className="lg:border-l lg:border-white/10 lg:pl-8 flex">
              <div
                className="w-full max-w-xl rounded-[32px] border border-white/12 bg-slate-950/55 p-5 shadow-[0_28px_90px_-46px_rgba(10,15,36,0.8)] backdrop-blur-2xl sm:p-7 h-full flex flex-col"
                style={
                  {
                    "--input-bg": "#ffffff",
                    "--input-border": "rgba(148,163,184,0.45)",
                    "--input-text": "#0f172a",
                    "--input-placeholder": "#64748b",
                    "--input-focus": "#38bdf8",
                    "--input-ring": "rgba(56,189,248,0.35)",
                  } as CSSProperties
                }
              >
                <div className="mb-4">
                  <p className="text-[0.92rem] font-black uppercase tracking-[0.22em] text-white/85">
                    {mode === "login" ? "Sign in" : "Sign up"}
                  </p>
                  <p className="mt-2 text-[1.18rem] leading-relaxed text-white/85">
                    {mode === "login"
                      ? "Use your credentials or a trusted provider."
                      : "Create your account to continue into the workspace."}
                  </p>
                </div>

                {!isSupabaseConfigured ? (
                  <div className="mb-3 rounded-2xl border border-amber-300/40 bg-amber-500/15 px-4 py-3 text-base font-semibold text-amber-200">
                    Supabase is not configured in frontend environment variables.
                  </div>
                ) : null}

                <div className="mb-4 grid grid-cols-2 rounded-2xl border border-white/12 bg-white/8 p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      window.localStorage.setItem("hrcrm_auth_mode", "login");
                      setError(null);
                      setInfo(null);
                    }}
                    className={`rounded-2xl px-4 py-3 text-[1.15rem] font-black transition ${
                      mode === "login" ? "bg-white/20 text-slate-900 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      window.localStorage.setItem("hrcrm_auth_mode", "signup");
                      setError(null);
                      setInfo(null);
                    }}
                    className={`rounded-2xl px-4 py-3 text-[1.15rem] font-black transition ${
                      mode === "signup" ? "bg-white/20 text-slate-900 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Sign up
                  </button>
                </div>

            {mode === "login" ? (
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-white/15 bg-white/12 px-4 py-3 text-[1.12rem] font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={() => void handleGoogleSignIn()}
                  disabled={isSubmitting || !isSupabaseConfigured}
                >
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Continue with Google
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-white/25 bg-white/18 px-4 py-3 text-[1.12rem] font-bold text-slate-900 shadow-[0_14px_40px_-26px_rgba(56,189,248,0.65)] transition hover:-translate-y-0.5 hover:bg-white/22 disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={() => void handleGithubSignIn()}
                  disabled={isSubmitting || !isSupabaseConfigured}
                >
                  <span className="inline-flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    Continue with GitHub
                  </span>
                  <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
            ) : null}

            {mode === "login" ? (
              <div className="mb-3 flex items-center gap-3 text-[0.82rem] font-bold uppercase tracking-[0.22em] text-white/80">
                <span className="h-px flex-1 bg-white/20" />
                Secure email access
                <span className="h-px flex-1 bg-white/20" />
              </div>
            ) : null}

            {mode === "login" ? (
              <form onSubmit={(event) => void handleLogin(event)} className="space-y-3">
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-[0.86rem] font-black uppercase tracking-[0.2em] text-sky-100">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    className="input-surface w-full px-4 py-3 text-[1.12rem]"
                    placeholder="name@company.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-1.5 block text-[0.86rem] font-black uppercase tracking-[0.2em] text-sky-100">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    className="input-surface w-full px-4 py-3 text-[1.12rem]"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error ? <p className="rounded-2xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-base font-semibold text-rose-200">{error}</p> : null}
                {info ? <p className="rounded-2xl border border-emerald-300/40 bg-emerald-400/15 px-4 py-3 text-base font-semibold text-emerald-200">{info}</p> : null}

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#1d4ed8_0%,#38bdf8_100%)] px-4 py-3.5 text-[1.15rem] font-bold text-white shadow-[0_16px_40px_-26px_rgba(56,189,248,0.7)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting || !isSupabaseConfigured}
                >
                  <LockKeyhole className="h-4 w-4" />
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </form>
            ) : (
              <form onSubmit={(event) => void handleSignup(event)} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="signup-name" className="mb-1.5 block text-[0.86rem] font-black uppercase tracking-[0.2em] text-sky-100">
                      Full name
                    </label>
                    <input
                      id="signup-name"
                      name="name"
                      autoComplete="name"
                      value={signupName}
                      onChange={(event) => setSignupName(event.target.value)}
                      className="input-surface w-full px-4 py-3 text-[1.12rem]"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-email" className="mb-1.5 block text-[0.86rem] font-black uppercase tracking-[0.2em] text-sky-100">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={signupEmail}
                      onChange={(event) => setSignupEmail(event.target.value)}
                      className="input-surface w-full px-4 py-3 text-[1.12rem]"
                      placeholder="name@company.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="mb-1.5 block text-[0.86rem] font-black uppercase tracking-[0.2em] text-sky-100">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
                      className="input-surface w-full px-4 py-3 text-[1.12rem]"
                      placeholder="Create a strong password"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-confirm-password" className="mb-1.5 block text-[0.86rem] font-black uppercase tracking-[0.2em] text-sky-100">
                      Confirm password
                    </label>
                    <input
                      id="signup-confirm-password"
                      type="password"
                      name="confirm-password"
                      autoComplete="new-password"
                      value={signupConfirmPassword}
                      onChange={(event) => setSignupConfirmPassword(event.target.value)}
                      className="input-surface w-full px-4 py-3 text-[1.12rem]"
                      placeholder="Repeat your password"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="mt-1 rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
                      <div className="h-2.5 w-full rounded-full bg-white/25">
                        <div
                          className={`h-full rounded-full ${passwordStrength.tone}`}
                          style={{ width: `${Math.max(passwordStrength.score * 100, 5)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[0.9rem] font-semibold text-white/85">
                        Password strength: {passwordStrength.label}
                      </p>
                    </div>
                  </div>
                </div>

                {error ? <p className="rounded-2xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-base font-semibold text-rose-200">{error}</p> : null}
                {info ? <p className="rounded-2xl border border-emerald-300/40 bg-emerald-400/15 px-4 py-3 text-base font-semibold text-emerald-200">{info}</p> : null}

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#1d4ed8_0%,#38bdf8_100%)] px-4 py-3.5 text-[1.15rem] font-bold text-white shadow-[0_16px_40px_-26px_rgba(56,189,248,0.7)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting || !isSupabaseConfigured}
                >
                  <UserPlus className="h-4 w-4" />
                  {isSubmitting ? "Creating account..." : "Create account"}
                </button>
              </form>
            )}

              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
