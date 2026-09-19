import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, Mail, PawPrint } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  getFirebaseAuthMessage,
  useFirebaseAuth,
} from "@/lib/auth-context";

type AuthMode = "signin" | "signup" | "reset" | "admin";

const copy: Record<AuthMode, { eyebrow: string; title: string; text: string }> = {
  signin: {
    eyebrow: "Welcome back",
    title: "Sign in to your account.",
    text: "Keep your care requests, adoption conversations, and next steps close.",
  },
  signup: {
    eyebrow: "Join the community",
    title: "Create your account.",
    text: "A small account makes it easier to stay close to the work and the dogs.",
  },
  reset: {
    eyebrow: "A fresh start",
    title: "Reset your password.",
    text: "We will send a secure reset link to the email on your account.",
  },
  admin: {
    eyebrow: "Private workspace",
    title: "Admin sign in.",
    text: "Use your authorized Firebase account to manage the live SaveStreet Dogs catalog.",
  },
};

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const [, navigate] = useLocation();
  const { user, loading, signIn, signUp, resetPassword } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && mode !== "reset") {
      navigate(mode === "admin" ? "/admin" : "/");
    }
  }, [loading, mode, navigate, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setBusy(true);

    try {
      if (mode === "reset") {
        await resetPassword(email);
        setStatus("Check your email for a secure password reset link.");
      } else if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        await signUp(email, password);
        navigate("/");
      } else {
        await signIn(email, password);
        navigate(mode === "admin" ? "/admin" : "/");
      }
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : getFirebaseAuthMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  const heading = copy[mode];
  return (
    <>
      <Meta title={heading.eyebrow} description={heading.text} />
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-mark">
            <PawPrint size={24} />
          </div>
          <div className="eyebrow">{heading.eyebrow}</div>
          <h1>{heading.title}</h1>
          <p>{heading.text}</p>
          {status && (
            <div
              className={`notice ${status.startsWith("Check your") ? "success" : "error"}`}
              role="status"
            >
              {status}
            </div>
          )}
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="auth-email">
                <Mail size={14} /> Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
            {mode !== "reset" && (
              <div className="field">
                <label htmlFor="auth-password">
                  <LockKeyhole size={14} /> Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={6}
                  required
                />
              </div>
            )}
            {mode === "signup" && (
              <div className="field">
                <label htmlFor="auth-confirm-password">Confirm password</label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            )}
            <button className="btn btn-primary auth-submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "reset"
                  ? "Send reset link"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              {!busy && <ArrowRight size={15} />}
            </button>
          </form>
          <div className="auth-links">
            {mode !== "signin" && mode !== "admin" && (
              <Link href="/login">Already have an account? Sign in</Link>
            )}
            {mode === "signin" && (
              <>
                <Link href="/signup">Create an account</Link>
                <Link href="/forgot-password">Forgot your password?</Link>
              </>
            )}
            {mode === "admin" && (
              <>
                <Link href="/forgot-password">Forgot your password?</Link>
                <Link href="/login">Public account sign in</Link>
              </>
            )}
            {mode === "reset" && <Link href="/login">Back to sign in</Link>}
          </div>
        </div>
      </main>
    </>
  );
}

function Meta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} · SaveStreet Dogs`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
  }, [description, title]);
  return null;
}