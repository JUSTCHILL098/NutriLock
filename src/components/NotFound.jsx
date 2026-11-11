import Brand from "./Brand";

export default function NotFound({ onGoHome }) {
  return (
    <div className="standalone-page">
      <header className="standalone-page__top">
        <div className="standalone-page__brand">
          <Brand tone="dark" />
        </div>
      </header>

      <main className="not-found" aria-labelledby="not-found-title">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <p className="eyebrow">Page not found</p>
        <h1 id="not-found-title">This page isn&rsquo;t here.</h1>
        <p className="not-found__lead">
          The address may be mistyped, or the page may have moved. Your workspace
          is still where you left it.
        </p>
        <div className="actions">
          <button type="button" className="btn btn--solid" onClick={onGoHome}>
            Back to NutriLock
          </button>
        </div>
      </main>

      <footer className="standalone-page__foot">
        Informational only, not a medical service.
      </footer>
    </div>
  );
}
