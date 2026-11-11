import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Brand from "./components/Brand";
import NotFound from "./components/NotFound";
import Feedback from "./components/Feedback";
import HomeView from "./views/HomeView";
import ProfileView from "./views/ProfileView";
import FoodCheckView from "./views/FoodCheckView";
import ReportsView from "./views/ReportsView";
import AboutView from "./views/AboutView";

const ROUTES = {
  home: { path: "/", label: "Home", title: "Home" },
  profile: { path: "/profile", label: "Health profile", title: "Health profile" },
  food: { path: "/food", label: "Food check", title: "Food check" },
  reports: { path: "/reports", label: "Reports", title: "Reports" },
  about: { path: "/about", label: "About", title: "About" },
};

const NOT_FOUND = "notFound";
const BASE_PATH = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

function routeFromLocation() {
  const hash = window.location.hash.replace(/^#\/?/, "").split("/")[0];
  if (hash) {
    if (ROUTES[hash]) return hash;
    if (hash === "404" || hash === "not-found") return NOT_FOUND;
  }

  let pathname = window.location.pathname;
  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    pathname = pathname.slice(BASE_PATH.length);
  }
  pathname = pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/404" || pathname === "/not-found") return NOT_FOUND;
  const match = Object.keys(ROUTES).find(
    (key) => ROUTES[key].path === pathname
  );
  return match || NOT_FOUND;
}

function pathFor(view) {
  const route = ROUTES[view];
  return `${BASE_PATH}${route && route.path !== "/" ? route.path : "/"}`;
}

function titleFor(view) {
  return view === NOT_FOUND
    ? "Page not found | NutriLock"
    : `${ROUTES[view].title} | NutriLock`;
}

function initialsFrom(name, email) {
  const source = (name || email || "NL").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [view, setView] = useState(routeFromLocation);
  const [profileName, setProfileName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [shellError, setShellError] = useState("");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;

      setUser(currentUser);
      setAuthReady(true);

      if (!currentUser) {
        setProfileName("");
        setProfileError("");
        setProfileLoading(false);
        setNavOpen(false);
        return;
      }

      setProfileLoading(true);
      try {
        const profileRef = doc(db, "users", currentUser.uid, "private", "profile");
        const snapshot = await getDoc(profileRef);
        if (!active) return;
        setProfileName(
          snapshot.exists()
            ? snapshot.data().displayName || ""
            : currentUser.displayName || ""
        );
        setProfileError("");
      } catch (error) {
        console.error("Profile read error:", error);
        if (!active) return;
        setProfileName(currentUser.displayName || "");
        setProfileError(
          "We couldn't load your saved profile. Firestore may not be enabled yet, or its security rules may need review."
        );
      } finally {
        if (active) setProfileLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (view !== NOT_FOUND && authReady && !user) {
      document.title = "Sign in | NutriLock";
      return;
    }
    document.title = titleFor(view);
  }, [view, authReady, user]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", navOpen);
    return () => document.body.classList.remove("nav-open");
  }, [navOpen]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const syncWithLocation = () => {
      setView(routeFromLocation());
      setNavOpen(false);
    };
    window.addEventListener("popstate", syncWithLocation);
    window.addEventListener("hashchange", syncWithLocation);
    return () => {
      window.removeEventListener("popstate", syncWithLocation);
      window.removeEventListener("hashchange", syncWithLocation);
    };
  }, []);

  function navigate(nextView) {
    if (!ROUTES[nextView]) return;
    const path = pathFor(nextView);
    if (window.location.pathname !== path || window.location.hash) {
      window.history.pushState({ view: nextView }, "", path);
    }
    setView(nextView);
    setNavOpen(false);
    setShellError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSignOut() {
    setShellError("");
    try {
      await signOut(auth);
      setView("home");
      window.history.replaceState(null, "", pathFor("home"));
    } catch (error) {
      console.error("Sign-out error:", error);
      setShellError(
        "Sign-out couldn't be completed. Check your connection and try again."
      );
    }
  }

  if (view === NOT_FOUND) {
    return <NotFound onGoHome={() => navigate("home")} />;
  }

  if (!authReady) {
    return (
      <div className="splash" role="status" aria-live="polite">
        <Brand tone="light" />
        <span className="splash__loader" aria-hidden="true" />
        <span className="sr-only">Loading NutriLock</span>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const displayName = profileName.trim() || user.displayName || "";
  const initials = initialsFrom(displayName, user.email);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Sidebar
        view={view}
        onNavigate={navigate}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <button
        className={`nav-scrim ${navOpen ? "is-visible" : ""}`}
        type="button"
        aria-label="Close navigation"
        tabIndex={navOpen ? 0 : -1}
        onClick={() => setNavOpen(false)}
      />

      <div className="workspace">
        <Topbar
          pageLabel={ROUTES[view].label}
          displayName={displayName}
          email={user.email}
          initials={initials}
          navOpen={navOpen}
          onOpenNav={() => setNavOpen(true)}
          onSignOut={handleSignOut}
        />

        <main className="workspace__main" id="main-content">
          {shellError && (
            <div className="workspace__alert">
              <Feedback message={shellError} type="error" />
            </div>
          )}
          <HomeView
            name={displayName}
            hidden={view !== "home"}
            onNavigate={navigate}
          />
          <ProfileView
            user={user}
            profileName={profileName}
            profileLoading={profileLoading}
            profileError={profileError}
            onProfileSaved={setProfileName}
            hidden={view !== "profile"}
          />
          <FoodCheckView hidden={view !== "food"} />
          <ReportsView hidden={view !== "reports"} />
          {view === "about" && <AboutView onNavigate={navigate} />}

          <footer className="app-footer">
            <span>NutriLock, development build</span>
            <span aria-hidden="true">/</span>
            <span>Informational only, not a medical service</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
