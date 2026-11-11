import { useState } from "react";
import Feedback from "../components/Feedback";
import PageHeader from "../components/PageHeader";

const suggestedTerms = [
  "milk",
  "egg",
  "peanut",
  "soy",
  "wheat",
  "sesame",
  "fish",
  "shellfish",
];

function parseTerms(value) {
  const seen = new Set();
  return value
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean)
    .filter((term) => {
      const key = term.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export default function FoodCheckView({ hidden }) {
  const [termsInput, setTermsInput] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const terms = parseTerms(termsInput);

  function updateTerms(value) {
    setTermsInput(value);
    setResult(null);
    setError("");
  }

  function toggleSuggestion(term) {
    const current = parseTerms(termsInput);
    const exists = current.some((item) => item.toLowerCase() === term);

    if (exists) {
      updateTerms(
        current.filter((item) => item.toLowerCase() !== term).join(", ")
      );
    } else {
      updateTerms([...current, term].join(", "));
    }
  }

  function removeTerm(term) {
    updateTerms(
      terms
        .filter((item) => item.toLowerCase() !== term.toLowerCase())
        .join(", ")
    );
  }

  function handleCheck() {
    if (!terms.length || !ingredients.trim()) {
      setResult(null);
      setError("Add at least one word to check for, then paste the ingredient list.");
      return;
    }

    const haystack = ingredients.toLowerCase();
    const found = terms.filter((term) => haystack.includes(term.toLowerCase()));

    setError("");
    setResult({
      found,
      checked: terms,
    });
  }

  return (
    <section
      className="view food-view"
      id="food"
      aria-labelledby="food-title"
      hidden={hidden}
    >
      <PageHeader
        eyebrow="Food information"
        title="Food check"
        titleId="food-title"
        description="Compare words you enter with ingredients copied from a food label. This is a transparent word match, not an allergy test."
      />

      <div className="split-layout">
        <div className="panel">
          <div className="form-heading">
            <h2>Words and ingredients</h2>
            <p>
              Enter the words you want to look for, then paste the ingredient list
              exactly as it appears on the label.
            </p>
          </div>

          <label htmlFor="allergenTerms">
            Words to check for
            <span className="label-note">Separate with commas</span>
          </label>
          <input
            id="allergenTerms"
            type="text"
            value={termsInput}
            onChange={(event) => updateTerms(event.target.value)}
            placeholder="Example: peanuts, milk, soy"
            autoComplete="off"
          />

          {terms.length > 0 && (
            <div className="term-list" aria-label="Words you are checking for">
              {terms.map((term) => (
                <span className="term-chip" key={term}>
                  {term}
                  <button
                    type="button"
                    onClick={() => removeTerm(term)}
                    aria-label={`Remove ${term}`}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="suggestion-block">
            <p id="suggested-label">Common words</p>
            <div className="suggestion-list" aria-labelledby="suggested-label">
              {suggestedTerms.map((term) => {
                const selected = terms.some(
                  (item) => item.toLowerCase() === term
                );
                return (
                  <button
                    type="button"
                    key={term}
                    className={selected ? "is-selected" : ""}
                    onClick={() => toggleSuggestion(term)}
                    aria-pressed={selected}
                  >
                    {term}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-divider" />

          <label htmlFor="ingredientList">
            Ingredients from the label
            <span className="label-note">Copy the full list</span>
          </label>
          <textarea
            id="ingredientList"
            value={ingredients}
            onChange={(event) => {
              setIngredients(event.target.value);
              setResult(null);
              setError("");
            }}
            placeholder="Paste the ingredient list here, exactly as it appears on the label."
            rows={7}
          />
          <div className="field-meta">
            <span>Include the complete list where possible.</span>
            <span>{ingredients.length} characters</span>
          </div>

          <div className="form-actions form-actions--between">
            <button type="button" className="btn btn--solid" onClick={handleCheck}>
              Check for matches
            </button>
            <span className="form-note">Nothing is sent or saved</span>
          </div>

          <div className="form-feedback" aria-live="polite">
            <Feedback message={error} type="error" />
          </div>

          {result && (
            <div
              className={`result-block ${
                result.found.length ? "result-block--found" : "result-block--none"
              }`}
              role="status"
            >
              <p className="result-block__label">
                {result.found.length ? "Matches found" : "No exact matches"}
              </p>
              <h3>
                {result.found.length
                  ? `${result.found.length} matching ${
                      result.found.length === 1 ? "word" : "words"
                    } in the ingredient list.`
                  : "None of your words appeared in this list."}
              </h3>

              {result.found.length > 0 && (
                <div className="match-list" aria-label="Matching words">
                  {result.found.map((term) => (
                    <span key={term}>{term}</span>
                  ))}
                </div>
              )}

              <p className="result-block__note">
                {result.found.length
                  ? "A matching word is worth investigating, but it does not confirm that this food is or isn't suitable for you."
                  : "This is not a safety result. An ingredient may still be present under another name, or cross-contact may be possible."}{" "}
                Check the complete label and ask a trusted adult or qualified
                healthcare professional if you are unsure.
              </p>
            </div>
          )}
        </div>

        <aside className="split-side">
          <section className="panel" aria-labelledby="how-title">
            <h2 id="how-title">How it works</h2>
            <ol className="step-notes">
              <li>
                <span aria-hidden="true">1</span>
                <p>Add the words you want to look for.</p>
              </li>
              <li>
                <span aria-hidden="true">2</span>
                <p>Paste ingredients from the label.</p>
              </li>
              <li>
                <span aria-hidden="true">3</span>
                <p>Review any exact word matches.</p>
              </li>
            </ol>
          </section>

          <section className="panel panel--wine" aria-labelledby="limits-title">
            <p className="panel__label">Important limits</p>
            <h2 id="limits-title">This is not an allergy detector.</h2>
            <ul className="limit-list">
              <li>It can miss hidden or alternate ingredient names.</li>
              <li>It does not check cross-contact warnings.</li>
              <li>A result cannot confirm that a food is safe.</li>
            </ul>
            <p className="panel-note panel-note--light">
              Always read the full label and seek qualified advice when needed.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
