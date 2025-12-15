// these are the components to render the selector to filter by council district

// import ViolationFilters from "./ViolationFilters";

const DISTRICTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function DistrictSelector({ filters, setFilters }) {
  const handleChange = (e) => {
    const value = e.target.value ? Number(e.target.value) : null;

    setFilters((prev) => ({
      ...prev,
      selectedDistrict: value,
      violationFilters: {
        ...prev.violationFilters,
        COUNCILDIST: value ? String(value) : null,
      }
    }));
  };

  const clearSelection = () => {
    setFilters((prev) => ({
      ...prev,
      selectedDistrict: null,
      violationFilters: {
        ...prev.violationFilters,
        COUNCILDIST: null,
      },
    }));
  };

  const hasSelection = filters.selectedDistrict != null;

  return (
    <div className="filter-panel">
      <header className="filter-header">
        <div>
          <h3>Council District</h3>
          <p>Highlight a council district on the map.</p>
        </div>
        {hasSelection && (
          <button type="button" className="filter-clear" onClick={clearSelection}>
            Clear
          </button>
        )}
      </header>

      <div className="filter-body">
        <label className="filter-select-label">
          Choose District
          <select value={filters.selectedDistrict || ""} onChange={handleChange}>
            <option value="">All districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                District {d}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
