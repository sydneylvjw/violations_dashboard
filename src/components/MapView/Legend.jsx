// these are the components to render the legend for the map
// based on the selected acs characteristics
import { useMemo } from "react";
import { getLegendBins } from "../../utils/colorScales";
import acsPanel from "../../data/acs.json";

const ACSVARIABLES = [
  { value: "year", label: "ACS Year" },
  { value: "popTotE", label: "Total Residents" },
  { value: "popWhiteE", label: "Total White Residents" },
  { value: "pctWhite", label: "Percent White Residents" },
  { value: "pctWhiteZ", label: "Percent White Residents (Z-score)" },
  { value: "popBlackE", label: "Total Black Residents" },
  { value: "pctBlack", label: "Percent Black Residents" },
  { value: "pctBlackZ", label: "Percent Black Residents (Z-score)" },
  { value: "popAsianE", label: "Total Asian Residents" },
  { value: "pctAsian", label: "Percent Asian Residents" },
  { value: "pctAsianZ", label: "Percent Asian Residents (Z-score)" },
  { value: "popHispE", label: "Total Hispanic Residents" },
  { value: "pctHisLat", label: "Percent Hispanic Residents" },
  { value: "pctHisLatZ", label: "Percent Hispanic Residents (Z-score)" },
  { value: "popMixedE", label: "Total Mixed Residents" },
  { value: "pctMixed", label: "Percent Mixed Residents" },
  { value: "pctMixedZ", label: "Percent Mixed Residents (Z-score)" },
  { value: "medHHincE", label: "Median Household Income" },
  { value: "pctPovE", label: "Percent Below Poverty" },
  { value: "medYrBuiltE", label: "Median Year Built" },
  { value: "unitsTotE", label: "Total Housing Units" },
  { value: "avgHHsizeE", label: "Average Household Size" },
  { value: "ownOccE", label: "Owner Occupied Housing Units" },
  { value: "pctOwnOcc", label: "Percent Owner Occupied Housing Units" },
  { value: "pctOwnOccZ", label: "Percent Owner Occupied Housing Units (Z-score)" },
  { value: "ownOccAvgHHsizeE", label: "Owner Occupied Average Household Size" },
  { value: "rentOccE", label: "Renter Occupied Housing Units" },
  { value: "pctRentOcc", label: "Percent Renter Occupied Housing Units" },
  { value: "pctRentZ", label: "Percent Renter Occupied Housing Units (Z-score)" },
  { value: "rentOccAvgHHsizeE", label: "Renter Occupied Average Household Size" },
  { value: "medSMOCAPIE", label: "Median Selected Monthly Owner Costs as a Percentage of Household Income" },
  { value: "medGRAPIE", label: "Median Gross Rent as a Percentage of Household Income" }
];


export default function Legend({ acsVariables }) {
  const bins = useMemo(
    () => getLegendBins(acsVariables, acsPanel.features),
    [acsVariables]
  );

  const hasNoData = useMemo(
    () =>
      acsPanel.features.some((f) => {
        const val = f.properties?.[acsVariables];
        return val === null || val === undefined || Number.isNaN(val);
      }),
    [acsVariables]
  );
  if (!bins.length) return null;

  const selected = ACSVARIABLES.find((v) => v.value === acsVariables);
  const selectedLabel = selected ? selected.label : acsVariables;

  return (
    <div className="legend-card">
      <div className="legend-title">{selectedLabel}</div>
      <div className="legend-scale">
        {bins.map((bin, i) => (
          <div className="legend-row" key={i}>
            <span className="legend-swatch" style={{ backgroundColor: bin.color }} />
            <span className="legend-label">{bin.label}</span>
          </div>
        ))}
        {hasNoData && (
          <div className="legend-row">
            <span
              className="legend-swatch"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(0,0,0,0.35) 0, rgba(0,0,0,0.35) 4px, transparent 4px, transparent 8px)",
                border: "1px solid #000",
              }}
            />
            <span className="legend-label">Not Enough Data</span>
          </div>
        )}
      </div>
    </div>
  );
}
