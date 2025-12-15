// components to render filterable census tract choropleths

import { GeoJSON } from "react-leaflet";
import { useMemo } from "react";
import { getColorScale } from "../../utils/colorScales";
import acsPanel from "../../data/acs.json";

export default function TractChoropleth({ acsVariables }) {
  const tractData = acsPanel; // FeatureCollection
  const activeVar = acsVariables || "medHHincE";

  // Build a gradient color scale for the selected variable
  const colorScale = useMemo(
    () => getColorScale(activeVar, tractData.features),
    [activeVar, tractData.features]
  );

  return (
    <GeoJSON
      data={tractData}
      style={(feature) => {
        const val = feature.properties[activeVar];
        const baseStyle =
          val === null || val === undefined || Number.isNaN(val)
            ? {
                fillColor: "transparent",
                fillOpacity: 0,
                dashArray: "2 4",
                color: "#000",
                weight: 0.6,
              }
            : {
                fillColor: colorScale(val),
                fillOpacity: 0.2,
                color: colorScale(val),
                weight: 0.5,
              };
        return baseStyle;
      }}
      onEachFeature={(feature, layer) => {
        const rawValue = feature.properties[activeVar];
        const tractName = feature.properties.NAME;

        let displayValue = "N/A";
        if (rawValue !== null && rawValue !== undefined) {
          displayValue =
            typeof rawValue === "number"
              ? rawValue.toLocaleString()
              : String(rawValue);
        }

        layer.bindTooltip(`${tractName}: ${displayValue}`, { sticky: true });
      }}
    />
  );
}
