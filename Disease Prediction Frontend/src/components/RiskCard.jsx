function RiskCard({ title, level }) {
  return (
    <div className="risk-card">
      <h3>{title}</h3>
      <p>Risk Level: {level}</p>
    </div>
  );
}

export default RiskCard;
