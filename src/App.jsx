
import { Suspense, lazy, useEffect, useState } from "react";

const MapView = lazy(() => import("./components/MapView/MapView"));

const DEFAULT_FILTERS = {
  selectedDistrict: null,
  acsVariables: "medHHincE",
  violationFilters: {
    YEARS: [],
    STATUSES: [],
    INSPECTDIST: [],
    RESOLUTIONCODE: [],
    PRIORITY: [],
    COUNCILDIST: null,
  },
};

export default function App() {
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem("dashboardFilters");
      return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
    } catch {
      return DEFAULT_FILTERS;
    }
  });

  useEffect(() => {
    localStorage.setItem("dashboardFilters", JSON.stringify(filters));
  }, [filters]);

  return (
    <Suspense fallback={<div className="app-loading">Loading dashboard…</div>}>
      <MapView filters={filters} setFilters={setFilters} />
    </Suspense>
  );
}
