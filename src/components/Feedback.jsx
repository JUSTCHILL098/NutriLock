const labels = {
  error: "Error",
  success: "Saved",
  notice: "Note",
};

export default function Feedback({ message, type = "notice" }) {
  if (!message) return null;

  return (
    <div
      className={`feedback feedback--${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <strong>{labels[type] || labels.notice}</strong>
      <span>{message}</span>
    </div>
  );
}
