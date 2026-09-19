import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { auth, authPersistence } from "./firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
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

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    setAuthTokenGetter(() => auth.currentUser?.getIdToken() ?? null);

    void authPersistence
      .then(() => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
          if (!active) return;
          setUser(nextUser);
          setLoading(false);
          if (!nextUser) {
            setIsAdmin(false);
            return;
          }

          const token = await nextUser.getIdTokenResult();
          if (active) {
            setIsAdmin(
                token.claims.admin === true ||
                  token.claims.role === "admin" ||
                  clientAdminUidAllowlist.has(nextUser.uid),
            );
          }
        });
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe?.();
      setAuthTokenGetter(null);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin,
      async signIn(email, password) {
        try {
          await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (error) {
          throw new Error(authMessage(error));
        }
      },
      async signUp(email, password) {
        try {
          await createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (error) {
          throw new Error(authMessage(error));
        }
      },
      async signOut() {
        await firebaseSignOut(auth);
      },
      async resetPassword(email) {
        try {
          await sendPasswordResetEmail(auth, email.trim());
        } catch (error) {
          throw new Error(authMessage(error));
        }
      },
    }),
    [isAdmin, loading, user],
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