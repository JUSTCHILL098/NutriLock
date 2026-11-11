import { X } from "lucide-react";
import Brand from "./Brand";

const navItems = [
  { id: "home", label: "Home", number: "01" },
  { id: "profile", label: "Health profile", number: "02" },
  { id: "food", label: "Food check", number: "03" },
  { id: "reports", label: "Reports", number: "04" },
  { id: "about", label: "About", number: "05" },
];

export default function Sidebar({ view, onNavigate, open, onClose }) {
  return (
    <aside
      id="workspace-nav"
      className={`sidebar ${open ? "is-open" : ""}`}
      aria-label="Sidebar"
    >
      <div className="sidebar__top">
        <Brand tone="light" />
        <button
          type="button"
          className="sidebar__close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={19} aria-hidden="true" />
        </button>
      </div>

      <p className="sidebar__tagline">
        A private workspace for everyday health details.
      </p>

      <nav className="sidebar__nav" aria-label="Main navigation">
        <p className="sidebar__label">Workspace</p>
        {navItems.map(({ id, label, number }) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              className={`sidebar__link ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(id)}
            >
              <span className="sidebar__index" aria-hidden="true">
                {number}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar__spacer" />

      <div className="sidebar__privacy">
        <strong>Privacy is part of the build.</strong>
        <p>
          Your profile is tied to your account. Food checks happen in this
          browser and are not submitted.
        </p>
      </div>

      <div className="sidebar__footer">
        <span className="status-dot" aria-hidden="true" />
        Development build, version 1.0
      </div>
    </aside>
  );
}
