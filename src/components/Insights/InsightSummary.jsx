// KPI cards showing overall violation stats

export default function InsightSummary({ filteredCount = 0, summary = {} }) {
  const hazardCount =
    summary.PRIORITY?.find(({ value }) => value === "HAZARDOUS")?.count ?? 0;
  const openCount =
    summary.STATUSES?.find(({ value }) => value === "IN VIOLATION")?.count ?? 0;
  const busyDistrict = summary.INSPECTDIST
    ? [...summary.INSPECTDIST].sort((a, b) => b.count - a.count)[0]
    : null;

  const cards = [
    {
      label: "Filtered violations",
      value: filteredCount.toLocaleString(),
      sublabel: "records in current view",
    },
    {
      label: "Hazardous cases",
      value: hazardCount.toLocaleString(),
      sublabel: "flagged as hazardous",
    },
    {
      label: "Open violations",
      value: openCount.toLocaleString(),
      sublabel: "still in violation",
    },
  ];

  return (
    <div className="filter-panel">
      <header className="filter-header">
        <div>
          <h3>Dashboard Insights</h3>
          <p>Use these KPIs to prioritize enforcement.</p>
        </div>
      </header>

      <div className="kpi-grid">
        {cards.map((card) => (
          <div className="kpi-card" key={card.label}>
            <span className="kpi-label">{card.label}</span>
            <span className="kpi-value">{card.value}</span>
            <span className="kpi-sublabel">{card.sublabel}</span>
          </div>
        ))}
      </div>

      {busyDistrict && (
        <div className="kpi-note">
          Highest volume district:{" "}
          <strong>
            {busyDistrict.value} ({busyDistrict.count.toLocaleString()} cases)
          </strong>
        </div>
      )}
    </div>
  );
}
