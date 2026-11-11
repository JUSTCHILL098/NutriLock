import { Menu } from "lucide-react";

function formatToday() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export default function Topbar({
  pageLabel,
  displayName,
  email,
  initials,
  navOpen,
  onOpenNav,
  onSignOut,
}) {
  return (
    <header className="topbar">
      <div className="topbar__context">
        <button
          type="button"
          className="topbar__menu"
          onClick={onOpenNav}
          aria-label="Open navigation"
          aria-expanded={navOpen}
          aria-controls="workspace-nav"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <div>
          <span className="topbar__kicker">NutriLock</span>
          <strong className="topbar__page">{pageLabel}</strong>
        </div>
      </div>

      <div className="topbar__actions">
        <span className="topbar__date">{formatToday()}</span>

        <div className="user-chip" title={displayName || email || "Signed in"}>
          <span className="avatar avatar--small" aria-hidden="true">
            {initials}
          </span>
          <span className="user-chip__copy">
            <strong>{displayName || "Signed in"}</strong>
            <span>{email}</span>
          </span>
        </div>

        <button type="button" className="topbar__signout" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
