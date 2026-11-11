import { Component } from "react";
import Brand from "./Brand";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("NutriLock render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="standalone-page">
          <header className="standalone-page__top">
            <div className="standalone-page__brand">
              <Brand tone="dark" />
            </div>
          </header>

          <main className="broken-page" aria-labelledby="broken-title">
            <p className="eyebrow">Something broke</p>
            <h1 id="broken-title">This page came apart.</h1>
            <p className="broken-page__lead">
              The rest of NutriLock is still intact, but this screen could not
              finish loading. Reloading usually fixes it. If it keeps happening,
              the browser console will have the details for whoever maintains
              the app.
            </p>
            <div className="actions">
              <button
                type="button"
                className="btn btn--solid"
                onClick={() => window.location.reload()}
              >
                Reload the page
              </button>
              <a className="btn btn--quiet" href={import.meta.env.BASE_URL}>
                Go to the home page
              </a>
            </div>
          </main>

          <footer className="standalone-page__foot">
            If you were part-way through an upload, please check your reports
            before trying again.
          </footer>
        </div>
      );
    }

    return this.props.children;
  }
}
