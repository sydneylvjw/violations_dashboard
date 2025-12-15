// importing map shell components--this is the container for all the map stuff
import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import ViolationsLayer from "./ViolationsLayer";
import TractChoropleth from "./TractChoropleth";
import DistrictBoundaries from "./DistrictBoundaries";
import Legend from "./Legend";
import "./mapView.css";
import "leaflet/dist/leaflet.css";
import ViolationFilters from "../Filters/ViolationFilters";
import TractFilters from "../Filters/TractFilters";
import DistrictSelector from "../Filters/DistrictSelector";
import ViolationDetail from "../Insights/ViolationDetail";
import InsightSummary from "../Insights/InsightSummary";

export default function MapView({ filters, setFilters }) {
  const [violationSummary, setViolationSummary] = useState({});
  const [selectedViolation, setSelectedViolation] = useState(null);
const [filteredCount, setFilteredCount] = useState(0);
  
  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Philadelphia Code Violations</h1>
          <p>Filter violations, highlight council districts, and compare ACS indicators.</p>
        </div>
<InsightSummary filteredCount={filteredCount} summary={violationSummary} />
        <ViolationDetail
          feature={selectedViolation}
          onClear={() => setSelectedViolation(null)}
        />
        <DistrictSelector filters={filters} setFilters={setFilters} />
        <TractFilters filters={filters} setFilters={setFilters} />
        <ViolationFilters
          filters={filters}
          setFilters={setFilters}
          summary={violationSummary}
        />
      </div>

      <div className="map-area">
        <MapContainer
          center={[39.9526, -75.1652]}
          zoom={11}
          style={{ height: "100vh", width: "100%" }}
onClick={() => setSelectedViolation(null)}
        >
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png?api_key=f9e2d3dc-7b6e-43f4-8ee1-2aa57eb3a037"
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          />

          <TractChoropleth
            acsVariables={filters.acsVariables}
            tractFilters={filters.tractFilters}
          />

          <DistrictBoundaries selectedDistrict={filters.selectedDistrict} />

          <ViolationsLayer
            violationFilters={filters.violationFilters}
selectedFeature={selectedViolation}
            onFeatureSelect={setSelectedViolation}
            onCountChange={setFilteredCount}
            onSummaryChange={setViolationSummary}
                      />

          <Legend acsVariables={filters.acsVariables} />
        </MapContainer>
      </div>
    </div>
  );
}
