const workspaceIndex = [
  {
    id: "profile",
    number: "01",
    title: "Health profile",
    description:
      "Choose the name NutriLock uses and check which Google account is signed in.",
    meta: "Saved to your account",
  },
  {
    id: "food",
    number: "02",
    title: "Food check",
    description:
      "Compare words from an ingredient list with the terms you want to look for.",
    meta: "Runs in this browser",
  },
  {
    id: "reports",
    number: "03",
    title: "Reports",
    description:
      "Upload a PDF or image, then send it for analysis when the backend is ready.",
    meta: "PDF, JPG or PNG",
  },
];

function firstName(value) {
  return value.trim().split(/\s+/)[0] || "";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatToday() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function HomeView({ name, hidden, onNavigate }) {
  const shortName = firstName(name || "");

  return (
    <section
      className="view home-view"
      id="home"
      aria-labelledby="home-title"
      hidden={hidden}
    >
      <header className="home-intro">
        <p className="meta-line">
          <span>{formatToday()}</span>
          <span>Private workspace</span>
        </p>
        <h1 id="home-title">
          {getGreeting()}
          {shortName ? `, ${shortName}` : ""}.
        </h1>
        <p className="home-intro__lead">
          Three everyday tools, kept in one place: the name you go by, a
          word-by-word look at a food label, and the health reports you choose to
          store.
        </p>
        <div className="actions">
          <button
            type="button"
            className="btn btn--solid"
            onClick={() => onNavigate("reports")}
          >
            Upload a report
          </button>
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => onNavigate("food")}
          >
            Check a food label
          </button>
        </div>
      </header>

      <section className="home-index" aria-labelledby="index-title">
        <div className="section-bar">
          <h2 id="index-title">In this workspace</h2>
          <p>No feed, no public profile, no scores.</p>
        </div>

        <ol className="index-list">
          {workspaceIndex.map(({ id, number, title, description, meta }) => (
            <li key={id}>
              <button type="button" onClick={() => onNavigate(id)}>
                <span className="index-list__number" aria-hidden="true">
                  {number}
                </span>
                <span className="index-list__copy">
                  <strong>{title}</strong>
                  <span>{description}</span>
                </span>
                <span className="index-list__meta">
                  <span>{meta}</span>
                  <span className="index-list__open" aria-hidden="true">
                    Open
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <div className="home-lower">
        <section className="home-guide" aria-labelledby="guide-title">
          <h2 id="guide-title">When to use what</h2>
          <ol className="numbered-notes">
            <li>
              <span aria-hidden="true">01</span>
              <div>
                <h3>Start with your name</h3>
                <p>
                  If the name on your Google account isn&rsquo;t the one you
                  want to see, set a display name once. It saves to your own
                  profile document.
                </p>
              </div>
            </li>
            <li>
              <span aria-hidden="true">02</span>
              <div>
                <h3>Read a label, not a promise</h3>
                <p>
                  Food check compares the words you type with the ingredient list
                  you paste. It reports exact matches only, so read the full label
                  before deciding anything.
                </p>
              </div>
            </li>
            <li>
              <span aria-hidden="true">03</span>
              <div>
                <h3>Keep a report findable</h3>
                <p>
                  Upload a PDF, JPG, or PNG up to 10 MB. The email step unlocks
                  after the upload and asks where the analysis should be sent.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <aside className="home-statement">
          <p className="home-statement__label">Where your information goes</p>
          <h2>Your account is the boundary.</h2>
          <p>
            Profile details and reports are stored under your signed-in account.
            Food checks never leave this browser tab, and there is no public
            profile to find.
          </p>
          <button
            type="button"
            className="text-link text-link--light"
            onClick={() => onNavigate("about")}
          >
            Read why NutriLock exists
          </button>
        </aside>
      </div>
    </section>
  );
}
