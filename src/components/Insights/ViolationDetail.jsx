// detail panel to show info about selected violation feature

export default function ViolationDetail({ feature, onClear }) {
  if (!feature) {
    return (
      <div className="filter-panel">
        <header className="filter-header">
          <div>
            <h3>Violation Detail</h3>
            <p>Select a point on the map to view parcel details.</p>
          </div>
        </header>
        <div className="filter-body">
          <p className="muted-text">
            Click any violation marker to load its address, filing year, resolution, and priority.
          </p>
        </div>
      </div>
    );
  }

  const props = feature.properties || {};

  const rows = [
    { label: "Year Filed", value: props.violation_year ?? "N/A" },
    { label: "Council District", value: props.council_district ?? "N/A" },
    { label: "Inspection District", value: props.inspect_district ?? "N/A" },
    { label: "Tract", value: props.censustract ?? "N/A" },
    { label: "Case Status", value: props.casestatus ?? "N/A" },
    { label: "Priority", value: props.caseprioritydesc ?? "N/A" },
    { label: "Resolution", value: props.violationresolutioncode ?? "N/A" },
    { label: "Subcode", value: props.subcode ?? "N/A" },
    { label: "Violation Class", value: props.viol_class ?? "N/A" },
  ];

  return (
    <div className="filter-panel">
      <header className="filter-header">
        <div>
          <h3>Violation Detail</h3>
          <p>Parcel snapshot for {props.address || "selected record"}.</p>
        </div>
        {onClear && (
          <button type="button" className="filter-clear" onClick={onClear}>
            Clear
          </button>
        )}
      </header>
      <div className="violation-summary">
        {rows.map(({ label, value }) => (
          <div className="summary-row" key={label}>
            <span>{label}</span>
            <span className="summary-count">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
