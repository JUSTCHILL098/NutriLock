import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import Feedback from "../components/Feedback";
import PageHeader from "../components/PageHeader";

function initialsFrom(name, email) {
  const source = (name || email || "NL").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function ProfileView({
  user,
  profileName,
  profileLoading,
  profileError,
  onProfileSaved,
  hidden,
}) {
  const [draft, setDraft] = useState(profileName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    setDraft(profileName);
  }, [profileName]);

  const accountName = user.displayName || profileName || "Your profile";
  const initials = initialsFrom(profileName || user.displayName, user.email);
  const dirty = draft.trim() !== profileName.trim();
  const tooLong = draft.length > 80;

  async function handleSave(event) {
    event.preventDefault();
    setMessage("");

    if (tooLong) {
      setMessage("Please use 80 characters or fewer.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    try {
      const displayName = draft.trim();
      await setDoc(
        doc(db, "users", user.uid, "private", "profile"),
        {
          displayName,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      onProfileSaved(displayName);
      setMessage("Your display name has been saved.");
      setMessageType("success");
    } catch (error) {
      console.error("Profile save error:", error);
      setMessage(
        "We couldn't save your profile. Firestore may not be enabled, or its security rules may not be configured yet."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="view profile-view"
      id="profile"
      aria-labelledby="profile-title"
      hidden={hidden}
    >
      <PageHeader
        eyebrow="Account"
        title="Health profile"
        titleId="profile-title"
        description="The basics of your workspace, kept deliberately small. Only a display name is saved here for now."
      />

      <div className="split-layout">
        <div className="panel profile-main">
          <div className="profile-identity">
            <span className="avatar avatar--large" aria-hidden="true">
              {initials}
            </span>
            <div className="profile-identity__copy">
              <h2>{accountName}</h2>
              <p>{user.email}</p>
            </div>
            <span className="profile-identity__method">Google sign-in</span>
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-heading">
              <h3>Display name</h3>
              <p>
                This is the name shown in NutriLock. If you leave it empty, your
                Google name is used.
              </p>
            </div>

            <label htmlFor="displayName">
              Name
              <span className="label-note">Optional</span>
            </label>
            <input
              id="displayName"
              type="text"
              maxLength={80}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setMessage("");
              }}
              placeholder="What should NutriLock call you?"
              disabled={profileLoading}
              autoComplete="name"
            />
            <div className="field-meta">
              <span>Stored in your private profile document.</span>
              <span className={tooLong ? "is-over" : ""}>{draft.length}/80</span>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn--solid"
                disabled={saving || profileLoading || tooLong || !dirty}
              >
                {saving ? "Saving" : "Save display name"}
              </button>
              {dirty && !saving && <span className="form-note">Unsaved change</span>}
              {!dirty && !saving && profileName && (
                <span className="form-note">No changes to save</span>
              )}
            </div>

            <div className="form-feedback" aria-live="polite">
              <Feedback message={profileError} type="error" />
              <Feedback message={message} type={messageType} />
            </div>
          </form>

          <div className="notice-block">
            <strong>Not a medical record.</strong>
            <p>
              Diagnoses, medications, allergies, and other sensitive health
              details do not belong here yet. They should wait until security
              rules, privacy notices, consent, backup, and deletion processes have
              been reviewed by the adult supervisor.
            </p>
          </div>
        </div>

        <aside className="split-side">
          <section className="panel" aria-labelledby="account-details-title">
            <h2 id="account-details-title">Sign-in details</h2>
            <dl className="detail-list">
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Method</dt>
                <dd>Google</dd>
              </div>
              <div>
                <dt>Workspace</dt>
                <dd>Private, per account</dd>
              </div>
            </dl>
          </section>

          <section className="panel" aria-labelledby="stored-title">
            <h2 id="stored-title">Stored in this build</h2>
            <ul className="plain-list">
              <li>Your display name</li>
              <li>Your signed-in account reference</li>
              <li>Uploaded reports, if you add any</li>
            </ul>
            <p className="panel-note">
              There is no public profile and no place to enter a medical history.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
