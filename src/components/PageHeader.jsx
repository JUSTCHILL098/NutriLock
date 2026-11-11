export default function PageHeader({
  eyebrow,
  title,
  titleId,
  description,
  children,
}) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 id={titleId}>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="page-header__actions">{children}</div>}
    </header>
  );
}
