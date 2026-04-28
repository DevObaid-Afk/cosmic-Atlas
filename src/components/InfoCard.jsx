export default function InfoCard({ title, metric, body, className = '' }) {
  return (
    <article className={`info-card reveal ${className}`}>
      <span className="info-card-metric">{metric}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
