import PageHeader from "../components/PageHeader";

export default function AboutView({ onNavigate }) {
  return (
    <section
      className="view about-view"
      id="about"
      aria-labelledby="about-title"
    >
      <PageHeader
        eyebrow="About NutriLock"
        title="Health information, kept in proportion."
        titleId="about-title"
        description="NutriLock is a small, deliberately limited workspace for everyday health details. It was built by Jeevika to make caring for your wellbeing feel more organised, and a lot less noisy."
      />

      <div className="about-intro">
        <p className="about-lead">
          Most health tools begin by asking for everything. NutriLock begins with
          three ordinary tasks: knowing what name to use, reading an ingredient
          list carefully, and keeping a report somewhere you can find it again.
        </p>
        <dl className="about-fact">
          <div>
            <dt>Created by</dt>
            <dd>Jeevika</dd>
          </div>
          <div>
            <dt>Purpose</dt>
            <dd>Everyday wellbeing</dd>
          </div>
          <div>
            <dt>Built with</dt>
            <dd>React, Vite, Firebase</dd>
          </div>
        </dl>
      </div>

      <section className="about-section" aria-labelledby="why-title">
        <h2 id="why-title">Why Jeevika built it</h2>
        <p>
          Jeevika started NutriLock around a simple observation: health
          information is rarely missing, but it is often scattered. A report sits
          in a downloads folder, an ingredient label is read in a hurry, and the
          details that matter are spread across apps that ask for far more than
          they need.
        </p>
        <p>
          Her aim was to create a wellbeing tool that takes care of people without
          taking over. NutriLock keeps its questions small, explains what each
          result can and cannot tell you, and leaves medical judgement where it
          belongs: with a qualified professional who knows your situation.
        </p>
      </section>

      <section className="about-section" aria-labelledby="scope-title">
        <h2 id="scope-title">What it does, and what it leaves alone</h2>
        <div className="about-columns">
          <div>
            <h3>Included</h3>
            <ul>
              <li>A display name saved to your own account</li>
              <li>A local word check against an ingredient list</li>
              <li>Report upload with progress and email analysis</li>
              <li>Plain explanations of every limit</li>
            </ul>
          </div>
          <div>
            <h3>Not included</h3>
            <ul>
              <li>Diagnosis, treatment, or medical advice</li>
              <li>A medical history or symptom diary</li>
              <li>Allergy detection or safety guarantees</li>
              <li>Public profiles, feeds, or social sharing</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section" aria-labelledby="principles-title">
        <h2 id="principles-title">Three principles</h2>
        <ol className="principle-list">
          <li>
            <span className="principle-list__number" aria-hidden="true">
              01
            </span>
            <div>
              <h3>Keep the claims small</h3>
              <p>
                A word match is reported as a word match. No tool here pretends
                to know more than it does.
              </p>
            </div>
          </li>
          <li>
            <span className="principle-list__number" aria-hidden="true">
              02
            </span>
            <div>
              <h3>Make privacy visible</h3>
              <p>
                You can see where information goes: your account for saved
                details, Firebase Storage for reports, and nowhere for food
                checks.
              </p>
            </div>
          </li>
          <li>
            <span className="principle-list__number" aria-hidden="true">
              03
            </span>
            <div>
              <h3>Leave room for people</h3>
              <p>
                Every result points back to the full label, the original report,
                or a trusted adult and healthcare professional.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <aside className="about-note" aria-label="A note from the creator">
        <p className="eyebrow">A note from the creator</p>
        <blockquote>
          I kept meeting people who had a report saved in one place and a food
          label in another, with no simple way to make sense of either. NutriLock
          is my attempt at a quieter starting point, and a reminder that caring
          for your wellbeing should not require giving away more than you need
          to.
        </blockquote>
        <p className="about-note__sign">
          <strong>Jeevika</strong>
          <span>Creator of NutriLock</span>
        </p>
      </aside>

      <div className="about-actions">
        <button
          type="button"
          className="btn btn--solid"
          onClick={() => onNavigate("food")}
        >
          Check a food label
        </button>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => onNavigate("reports")}
        >
          Open reports
        </button>
      </div>
    </section>
  );
}
