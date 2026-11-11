export default function Brand({ tone = "dark" }) {
  return (
    <div className={`brand brand--${tone}`} aria-label="NutriLock">
      <span className="brand__type">
        Nutri<span>Lock</span>
      </span>
    </div>
  );
}
