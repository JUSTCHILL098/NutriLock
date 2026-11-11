import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import Brand from "./Brand";
import Feedback from "./Feedback";

const errorMessages = {
  "auth/unauthorized-domain":
    "This website address isn't authorised in Firebase. Ask the project supervisor to add the exact hosting domain in Authentication, Settings, Authorised domains.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in pop-up. Allow pop-ups for this site and try again.",
  "auth/operation-not-allowed":
    "Google sign-in isn't enabled in Firebase Authentication yet.",
  "auth/network-request-failed":
    "A network error occurred. Check your internet connection and try again.",
  "auth/popup-closed-by-user":
    "The sign-in window was closed before it finished. Try again whenever you're ready.",
  "auth/cancelled-popup-request":
    "Another sign-in window is already open. Close it and try again.",
};

const tools = [
  ["01", "A health profile", "The name you would like NutriLock to use."],
  ["02", "A food check", "A local word match against an ingredient list."],
  ["03", "Your reports", "A private upload, then an emailed analysis."],
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.3 13.5 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.6 2.9-2.2 5.4-4.6 7.1l7.4 5.7c4.3-4 6.9-9.9 6.9-17.3z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.6A14.5 14.5 0 0 1 9.6 24c0-1.6.3-3.2.8-4.6l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.6 2.6 10.7l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.4-5.7c-2 1.4-4.6 2.2-7.8 2.2-6.3 0-11.7-4-13.6-9.5l-7.8 6.1C6.5 43 14.6 48 24 48z"
      />
    </svg>
  );
}

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("notice");

  async function handleGoogleSignIn() {
    setLoading(true);
    setMessage("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in error:", error);
      setMessage(
        errorMessages[error.code] ||
          "Sign-in couldn't be completed. Please try again, or ask the project supervisor to check the Firebase Authentication settings."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-story" aria-labelledby="auth-story-title">
        <Brand tone="light" />

        <div className="auth-story__body">
          <p className="auth-story__label">A private health workspace</p>
          <h1 id="auth-story-title">A place for the health details you actually keep.</h1>
          <p className="auth-story__lead">
            NutriLock holds a small profile, a plain-language food check, and the
            reports you choose to store. Nothing more than it needs.
          </p>
        </div>

        <ol className="auth-story__list">
          {tools.map(([number, title, description]) => (
            <li key={number}>
              <span aria-hidden="true">{number}</span>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="auth-story__foot">
          Created by Jeevika for everyday wellbeing.
        </p>
      </section>

      <main className="auth-main">
        <div className="auth-panel">
          <p className="eyebrow">Sign in</p>
          <h2>Open your workspace.</h2>
          <p className="auth-panel__lead">
            Use your Google account. Your details stay tied to that account, and
            no one else can sign in as you.
          </p>

          <button
            type="button"
            className="google-button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="google-button__spinner" aria-hidden="true" />
            ) : (
              <GoogleIcon />
            )}
            <span>{loading ? "Connecting" : "Continue with Google"}</span>
          </button>

          <div className="auth-panel__feedback" aria-live="polite">
            <Feedback message={message} type={messageType} />
          </div>

          <div className="auth-assurance">
            <h3>Before you sign in</h3>
            <p>
              Use a test account during setup. Please don&rsquo;t enter real
              medical information until the project supervisor has reviewed the
              security and privacy settings.
            </p>
          </div>
        </div>

        <p className="auth-main__foot">
          Development build / Informational only / Not a medical service
        </p>
      </main>
    </div>
  );
}
