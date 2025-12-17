// these are the components to render filterable district boundaries on the map

import { GeoJSON } from "react-leaflet";
import councilDistricts from "../../data/Council_Districts_2024.json";
import { useMemo } from "react";
import inspectDistricts from "../../data/LI_DISTRICTS.json";


export default function DistrictBoundaries({ selectedDistrict }) {
  const mergedData = useMemo(() => {
    const features = [];
    if (councilDistricts?.features) features.push(...councilDistricts.features);
    if (inspectDistricts?.features) features.push(...inspectDistricts.features);
    return { type: "FeatureCollection", features };
  }, []);

  const selectedStr = selectedDistrict != null ? String(selectedDistrict) : null;

  const styleFn = useMemo(
    () => (feature) => {
      const dist = feature.properties?.DISTRICT
        ? String(feature.properties.DISTRICT)
        : null;

      const isSelected = selectedStr && dist === selectedStr;

      return {
        weight: isSelected ? 3 : 1.5,
        color: "#000",
        opacity: isSelected ? 1 : 0.5,
        fillColor: "transparent",
        fillOpacity: 0,
      };
    },
    [selectedStr]
  );

  return (
    <GeoJSON
      data={mergedData}
      style={styleFn}
      onEachFeature={(feature, layer) => {
        const dist = feature.properties?.DISTRICT;
        if (dist != null) {
          layer.bindTooltip(`District ${dist}`, { sticky: true });
        }
      }}
    />
  );
}
