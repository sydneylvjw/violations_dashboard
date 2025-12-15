
import { useEffect, useState } from "react";
import MapView from "./components/MapView/MapView";

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

    return <MapView filters={filters} setFilters={setFilters} />;
}
