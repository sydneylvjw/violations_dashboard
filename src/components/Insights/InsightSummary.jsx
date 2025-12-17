// KPI cards showing overall violation stats

export default function InsightSummary({ filteredCount = 0, summary = {}, stats = {} }) {
  const hazardCount =
    stats.hazardCount ??
    summary.PRIORITY?.find(({ value }) => value === "IMMINENTLY DANGEROUS")?.count ??
    0;
  const openCount =
    stats.openCount ??
    summary.STATUSES?.find(({ value }) => value === null)?.count ??
    0;
  const busyDistrict =
    stats.busyDistrict ??
    (summary.INSPECTDIST
      ? [...summary.INSPECTDIST].sort((a, b) => b.count - a.count)[0]
      : null);

  const cards = [
    {
      label: "Filtered Violations",
      value: filteredCount.toLocaleString(),
      sublabel: "records in current view",
    },
    {
      label: "Hazardous Cases",
      value: hazardCount.toLocaleString(),
      sublabel: "flagged as hazardous",
    },
    {
      label: "Open Violations",
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
