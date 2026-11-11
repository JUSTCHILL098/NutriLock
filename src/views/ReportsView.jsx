import { useRef, useState } from "react";
import { ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { auth, functions, storage } from "../firebase";
import Feedback from "../components/Feedback";
import PageHeader from "../components/PageHeader";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fileExtension(name) {
  return name.split(".").pop()?.toUpperCase() || "FILE";
}

function validateFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const hasAllowedType = ALLOWED_TYPES.includes(file.type);
  const hasAllowedExtension = ALLOWED_EXTENSIONS.includes(extension);

  if (!hasAllowedType && !hasAllowedExtension) {
    return "That file type isn't supported. Please choose a PDF, JPG, or PNG report.";
  }
  if (file.size > MAX_BYTES) {
    return "That file is larger than 10 MB. Please choose a smaller report.";
  }
  return "";
}

export default function ReportsView({ hidden }) {
  const inputRef = useRef(null);
  const emailStepRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadMessageType, setUploadMessageType] = useState("notice");
  const [email, setEmail] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [analysisMessageType, setAnalysisMessageType] = useState("notice");

  function resetUploadState() {
    setUploaded(null);
    setProgress(0);
    setUploadMessage("");
    setAnalysisMessage("");
  }

  function chooseFile(candidate) {
    if (!candidate || uploading) return;
    const validationError = validateFile(candidate);
    if (validationError) {
      resetUploadState();
      setFile(null);
      setUploadMessage(validationError);
      setUploadMessageType("error");
      return;
    }
    setFile(candidate);
    setUploadMessage("");
    setAnalysisMessage("");
    setUploaded(null);
    setProgress(0);
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    chooseFile(selected);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  function removeFile() {
    if (uploading) return;
    setFile(null);
    resetUploadState();
  }

  async function handleUpload() {
    const user = auth.currentUser;
    setUploadMessage("");

    if (!user) {
      setUploadMessage("Please sign in again before uploading.");
      setUploadMessageType("error");
      return;
    }
    if (!file) {
      setUploadMessage("Choose a PDF, JPG, or PNG report first.");
      setUploadMessageType("error");
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setUploadMessage(validationError);
      setUploadMessageType("error");
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadMessageType("notice");
    setUploadMessage("Uploading your report securely.");

    try {
      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 100);
      const path = `users/${user.uid}/reports/${Date.now()}_${safeName}`;
      const target = storageRef(storage, path);
      const task = uploadBytesResumable(target, file, {
        contentType: file.type || "application/octet-stream",
        customMetadata: { ownerUid: user.uid },
      });

      await new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          (snapshot) => {
            const percent = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(percent);
            setUploadMessage(`Uploading your report securely. ${percent}%`);
          },
          reject,
          resolve
        );
      });

      setProgress(100);
      setUploaded({
        path,
        name: file.name,
        size: file.size,
        type: file.type,
      });
      setUploadMessage(
        "Report uploaded. Next, add the email address that should receive the result."
      );
      setUploadMessageType("success");

      window.setTimeout(() => {
        emailStepRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 120);
    } catch (error) {
      console.error("Report upload error:", error);
      setUploaded(null);
      setUploadMessage(
        "The upload couldn't be completed. Firebase Storage may still need to be enabled, or its private per-user security rules may need review."
      );
      setUploadMessageType("error");
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    const user = auth.currentUser;
    const trimmedEmail = email.trim();
    setAnalysisMessage("");

    if (!user) {
      setAnalysisMessage("Please sign in again.");
      setAnalysisMessageType("error");
      return;
    }
    if (!uploaded) {
      setAnalysisMessage("Upload a report before requesting analysis.");
      setAnalysisMessageType("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setAnalysisMessage("Enter a valid email address.");
      setAnalysisMessageType("error");
      return;
    }

    setAnalyzing(true);
    setAnalysisMessageType("notice");
    setAnalysisMessage(
      "Submitting your report for secure analysis and email delivery."
    );

    try {
      const processReport = httpsCallable(functions, "processHealthReport");
      const result = await processReport({
        storagePath: uploaded.path,
        recipientEmail: trimmedEmail,
        fileName: uploaded.name,
      });
      const data = result.data || {};

      if (data.emailSent === true) {
        setAnalysisMessage(
          "Your report was processed and the result email was sent. Please check your inbox and spam folder."
        );
        setAnalysisMessageType("success");
      } else {
        setAnalysisMessage(
          "The backend received the request, but email delivery hasn't been confirmed yet. Please contact the project supervisor."
        );
        setAnalysisMessageType("notice");
      }
    } catch (error) {
      console.error("Report analysis error:", error);
      const code = error.code || "";
      setAnalysisMessage(
        code.includes("not-found")
          ? "The secure analysis service isn't deployed yet. Your upload is saved, but analysis and email delivery aren't active. The project supervisor needs to deploy the processHealthReport Firebase Function and configure its AI and email services."
          : "The report couldn't be processed. Check that the secure backend is deployed and configured, then try again."
      );
      setAnalysisMessageType("error");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <section
      className="view reports-view"
      id="reports"
      aria-labelledby="reports-title"
      hidden={hidden}
    >
      <PageHeader
        eyebrow="Your documents"
        title="Health reports"
        titleId="reports-title"
        description="Upload a report to your own account, then choose where the analysis should be emailed once the secure backend is ready."
      />

      <div className="process" aria-label="Report upload progress">
        <div className={`process__step ${uploaded ? "is-done" : "is-current"}`}>
          <span className="process__number">
            {uploaded ? "Done" : "01"}
          </span>
          <div>
            <strong>Upload report</strong>
            <span>{uploaded ? "Stored in your account" : "Choose a supported file"}</span>
          </div>
        </div>
        <span className="process__rule" aria-hidden="true" />
        <div className={`process__step ${uploaded ? "is-current" : ""}`}>
          <span className="process__number">02</span>
          <div>
            <strong>Email result</strong>
            <span>{uploaded ? "Ready for an address" : "Unlocks after upload"}</span>
          </div>
        </div>
      </div>

      <div className="split-layout reports-layout">
        <div className="reports-main">
          <section className="panel report-step" aria-labelledby="upload-step-title">
            <div className="step-heading">
              <span className="step-heading__number" aria-hidden="true">
                01
              </span>
              <div>
                <h2 id="upload-step-title">Choose your report</h2>
                <p>A PDF, JPG, or PNG file, up to 10 MB.</p>
              </div>
              <span className="step-heading__tag">Private upload</span>
            </div>

            <input
              ref={inputRef}
              id="reportFile"
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={handleFileChange}
              aria-label="Choose a health report file"
            />

            <div
              className={`dropzone ${dragActive ? "is-dragging" : ""} ${
                uploading ? "is-busy" : ""
              } ${file ? "has-file" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => !uploading && inputRef.current?.click()}
              onKeyDown={(event) => {
                if (
                  !uploading &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (!uploading) setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <strong>Drop a report here, or browse your files</strong>
                  <span className="dropzone__sub">
                    PDF, JPG or PNG. Maximum 10 MB.
                  </span>
                </>
              ) : (
                <div className="selected-file">
                  <span className="selected-file__type" aria-hidden="true">
                    {fileExtension(file.name)}
                  </span>
                  <span className="selected-file__copy">
                    <strong>{file.name}</strong>
                    <span>
                      {formatBytes(file.size)} / {fileExtension(file.name)}
                    </span>
                  </span>
                  <span className="selected-file__status">
                    {uploaded ? "Uploaded" : "Click to replace"}
                  </span>
                </div>
              )}
            </div>

            {file && (
              <div className="file-tools">
                <span>Stored under your signed-in account only.</span>
                <button
                  type="button"
                  onClick={removeFile}
                  disabled={uploading}
                >
                  Remove file
                </button>
              </div>
            )}

            {(uploading || progress > 0) && (
              <div className="upload-progress">
                <div className="upload-progress__meta">
                  <span>{uploaded ? "Upload complete" : "Uploading"}</span>
                  <strong>{progress}%</strong>
                </div>
                <div
                  className="upload-progress__track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  aria-label="Report upload progress"
                >
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="upload-actions">
              <button
                type="button"
                className="btn btn--solid"
                onClick={handleUpload}
                disabled={!file || uploading || Boolean(uploaded)}
              >
                {uploading
                  ? "Uploading"
                  : uploaded
                    ? "Report uploaded"
                    : "Upload report"}
              </button>
              <span className="form-note">Firebase Storage</span>
            </div>

            <div className="form-feedback" aria-live="polite">
              <Feedback message={uploadMessage} type={uploadMessageType} />
            </div>
          </section>

          <section
            ref={emailStepRef}
            className={`panel report-step email-step ${
              uploaded ? "is-ready" : "is-locked"
            }`}
            aria-labelledby="email-step-title"
          >
            <div className="step-heading">
              <span className="step-heading__number" aria-hidden="true">
                02
              </span>
              <div>
                <h2 id="email-step-title">Where should the result go?</h2>
                <p>Enter an address you can access.</p>
              </div>
              <span className="step-heading__tag">Email delivery</span>
            </div>

            {!uploaded ? (
              <div className="locked-state">
                <strong>Locked until your upload finishes.</strong>
                <p>
                  Once the report is safely stored, this step lets you enter the
                  email address that should receive the analysis.
                </p>
              </div>
            ) : (
              <>
                <div className="email-context">
                  <span aria-hidden="true">Ready</span>
                  <p>
                    <strong>{uploaded.name}</strong> is ready for analysis.
                  </p>
                </div>

                <label htmlFor="reportEmail">Email address</label>
                <input
                  id="reportEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setAnalysisMessage("");
                  }}
                  required
                />
                <p className="field-help">
                  Use an address you can access. The result is informational and
                  should not replace advice from a healthcare professional.
                </p>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn--solid"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                  >
                    {analyzing ? "Submitting" : "Analyze report and email result"}
                  </button>
                </div>

                <div className="form-feedback" aria-live="polite">
                  <Feedback
                    message={analysisMessage}
                    type={analysisMessageType}
                  />
                </div>
              </>
            )}
          </section>
        </div>

        <aside className="split-side">
          <section className="panel" aria-labelledby="checks-title">
            <h2 id="checks-title">Before you upload</h2>
            <ul className="plain-list plain-list--ruled">
              <li>PDF, JPG, or PNG format</li>
              <li>10 MB maximum file size</li>
              <li>Uploaded under your own account</li>
              <li>An email address ready for delivery</li>
            </ul>
            <p className="panel-note">One report at a time.</p>
          </section>

          <section className="panel panel--wine" aria-labelledby="privacy-title">
            <p className="panel__label">Privacy and safety</p>
            <h2 id="privacy-title">Handle reports with care.</h2>
            <p>
              Health reports contain sensitive information. Use this feature only
              with permission and after the project supervisor has reviewed
              storage rules, privacy notices, consent, retention, and deletion.
            </p>
            <p className="panel-note panel-note--light">
              Automated output is informational. It is never a diagnosis or a
              substitute for a healthcare professional.
            </p>
            <p className="panel-note panel-note--light">
              Please don&rsquo;t upload real medical records until the secure
              backend is deployed and tested.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
