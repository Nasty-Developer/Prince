import type { User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

type FirebaseAuthApi = typeof import("firebase/auth");
type FirebaseAuthModule = typeof import("./firebase-auth");
type FirebaseRuntime = {
  api: FirebaseAuthApi;
  auth: FirebaseAuthModule["auth"];
  authPersistence: FirebaseAuthModule["authPersistence"];
};

let firebaseRuntimePromise: Promise<FirebaseRuntime> | null = null;
let currentTokenGetter: (() => Promise<string | null>) | null = null;

function loadFirebaseRuntime(): Promise<FirebaseRuntime> {
  if (!firebaseRuntimePromise) {
    firebaseRuntimePromise = Promise.all([
      import("firebase/auth"),
      import("./firebase-auth"),
    ])
      .then(([api, firebase]) => ({
        api,
        auth: firebase.auth,
        authPersistence: firebase.authPersistence,
      }))
      .catch((error: unknown) => {
        firebaseRuntimePromise = null;
        throw error;
      });
  }
  return firebaseRuntimePromise;
}

export function getFirebaseIdToken(): Promise<string | null> {
  return currentTokenGetter?.() ?? Promise.resolve(null);
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  initializationError: string | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const clientAdminUidAllowlist = new Set(
  (import.meta.env.VITE_ADMIN_FIREBASE_UIDS ?? "")
    .split(",")
    .map((value: string) => value.trim())
    .filter(Boolean),
);

function authMessage(error: unknown): string {
  const code = error instanceof Error && "code" in error
    ? String((error as Error & { code?: string }).code)
    : "";
  const rawMessage = error instanceof Error ? error.message : "";

  if (rawMessage.includes("CONFIGURATION_NOT_FOUND")) {
    return "Firebase Email/Password Authentication is not enabled for this project. Enable it in Firebase Console → Authentication → Sign-in method, then try again.";
  }

  const messages: Record<string, string> = {
    "auth/configuration-not-found":
      "Firebase Email/Password Authentication is not enabled for this project. Enable it in Firebase Console → Authentication → Sign-in method, then try again.",
    "auth/email-already-in-use": "An account already exists for this email.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-api-key":
      "The Firebase web configuration is not accepted by this project.",
    "auth/app-not-authorized":
      "This app is not authorized for the configured Firebase project.",
    "auth/operation-not-allowed":
      "Firebase Email/Password Authentication is not enabled for this project. Enable it in Firebase Console → Authentication → Sign-in method, then try again.",
    "auth/password-does-not-meet-requirements":
      "Choose a stronger password that meets Firebase's password policy.",
    "auth/weak-password": "Use a password with at least six characters.",
    "auth/user-not-found": "No account was found for this email.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "The network request failed. Please try again.",
  };

  return messages[code] ?? "Authentication failed. Please try again.";
}

export function getFirebaseAuthMessage(error: unknown): string {
  return authMessage(error);
}

function initializationMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : "";
  const missingConfig = rawMessage.match(
    /^Firebase configuration is incomplete\.\s*Missing:\s*(.+)$/i,
  );
  if (missingConfig) {
    const envNames: Record<string, string> = {
      apiKey: "VITE_FIREBASE_API_KEY",
      authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
      projectId: "VITE_FIREBASE_PROJECT_ID",
      storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
      messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
      appId: "VITE_FIREBASE_APP_ID",
      measurementId: "VITE_FIREBASE_MEASUREMENT_ID",
    };
    const variables = missingConfig[1]
      .split(",")
      .map((key) => envNames[key.trim()] ?? key.trim())
      .join(", ");
    return `Firebase sign-in and image uploads are unavailable. Add these settings to this Replit project: ${variables}.`;
  }
  return "We couldn't restore your Firebase sign-in state. You can still browse and try signing in again.";
}

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    let bootstrapTimeout: number | undefined;

    const finishInitialization = (error: string | null) => {
      if (!active) return;
      if (bootstrapTimeout !== undefined) {
        window.clearTimeout(bootstrapTimeout);
        bootstrapTimeout = undefined;
      }
      setInitializationError(error);
      setLoading(false);
    };

    bootstrapTimeout = window.setTimeout(() => {
      finishInitialization(
        "Firebase sign-in is taking longer than expected. You can browse while it reconnects.",
      );
    }, 8000);

    void loadFirebaseRuntime()
      .then(async ({ api, auth, authPersistence }) => {
        if (!active) return;
        const tokenGetter = () => auth.currentUser?.getIdToken() ?? Promise.resolve(null);
        currentTokenGetter = tokenGetter;
        setAuthTokenGetter(tokenGetter);
        await authPersistence;
        if (!active) return;
        unsubscribe = api.onAuthStateChanged(auth, async (nextUser) => {
          if (!active) return;
          setLoading(true);
          setUser(nextUser);
          if (!nextUser) {
            setIsAdmin(false);
            finishInitialization(null);
            return;
          }

          try {
            const token = await nextUser.getIdTokenResult();
            if (!active) return;
            setIsAdmin(
              token.claims.admin === true ||
                token.claims.role === "admin" ||
                clientAdminUidAllowlist.has(nextUser.uid),
            );
            finishInitialization(null);
          } catch {
            setIsAdmin(false);
            finishInitialization(
              "We couldn't restore your Firebase sign-in state. You can still browse and try signing in again.",
            );
          }
        }, () => {
          if (!active) return;
          setUser(null);
          setIsAdmin(false);
          finishInitialization(
            "We couldn't restore your Firebase sign-in state. You can still browse and try signing in again.",
          );
        });
      })
      .catch((error: unknown) => {
        finishInitialization(initializationMessage(error));
      });

    return () => {
      active = false;
      if (bootstrapTimeout !== undefined) {
        window.clearTimeout(bootstrapTimeout);
      }
      unsubscribe?.();
      currentTokenGetter = null;
      setAuthTokenGetter(null);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      initializationError,
      isAdmin,
      async signIn(email, password) {
        try {
          const { api, auth } = await loadFirebaseRuntime();
          await api.signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (error) {
          throw new Error(authMessage(error));
        }
      },
      async signUp(email, password) {
        try {
          const { api, auth } = await loadFirebaseRuntime();
          await api.createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (error) {
          throw new Error(authMessage(error));
        }
      },
      async signOut() {
        const { api, auth } = await loadFirebaseRuntime();
        await api.signOut(auth);
      },
      async resetPassword(email) {
        try {
          const { api, auth } = await loadFirebaseRuntime();
          await api.sendPasswordResetEmail(auth, email.trim());
        } catch (error) {
          throw new Error(authMessage(error));
        }
      },
    }),
    [initializationError, isAdmin, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useFirebaseAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used inside FirebaseAuthProvider");
  }
  return context;
}