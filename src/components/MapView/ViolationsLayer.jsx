import { useEffect, useMemo, useState } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";

const FILTER_COLORS = {
  YEARS: "#c1cbaf",
  STATUSES: "#9daaa0",
  INSPECTDIST: "#664d50",
  RESOLUTIONCODE: "#b26c62",
  PRIORITY: "#cec073",
};

const getFeatureKey = (feature) => {
  if (!feature) return null;
  const coords = Array.isArray(feature.geometry?.coordinates)
    ? feature.geometry.coordinates.join(",")
    : "";
  const address = feature.properties?.address ?? "";
  const year = feature.properties?.violation_year ?? "";
  return `${coords}|${year}|${address}`;
};

export default function ViolationsLayer({
  violationFilters,
  onSummaryChange,
  onFeatureSelect,
  onCountChange,
  selectedFeature,
}) {
  const vf = violationFilters || {};
  const yearsFilter = Array.isArray(vf.YEARS) ? vf.YEARS : [];
  const statusesFilter = Array.isArray(vf.STATUSES) ? vf.STATUSES : [];
  const inspectFilter = Array.isArray(vf.INSPECTDIST) ? vf.INSPECTDIST : [];
  const resolutionFilter = Array.isArray(vf.RESOLUTIONCODE) ? vf.RESOLUTIONCODE : [];
  const priorityFilter = Array.isArray(vf.PRIORITY) ? vf.PRIORITY : [];
  const councilFilter = vf.COUNCILDIST ?? null;

  const [allFeatures, setAllFeatures] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch("https://media.githubusercontent.com/media/sydneylvjw/violations-data-lfs/main/data/violations_small.json")
      .then((res) => res.json())
      .then((fc) => {
        if (!cancelled) setAllFeatures(fc.features ?? []);
      })
      .catch((err) => console.error("Failed to load violations_small.json", err));

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFeatures = useMemo(() => {
    return allFeatures.filter((feature) => {
      const props = feature.properties || {};

      const yearValue = Number(props.violation_year);
      if (
        yearsFilter.length &&
        !yearsFilter.includes(Number.isNaN(yearValue) ? null : yearValue)
      )
        return false;

      if (statusesFilter.length && !statusesFilter.includes(String(props.casestatus)))
        return false;
      if (inspectFilter.length && !inspectFilter.includes(String(props.inspect_district)))
        return false;
      if (councilFilter != null && String(props.council_district) !== String(councilFilter))
        return false;
      if (
        resolutionFilter.length &&
        !resolutionFilter.includes(String(props.violationresolutioncode))
      )
        return false;
      if (priorityFilter.length && !priorityFilter.includes(String(props.caseprioritydesc)))
        return false;
      return true;
    });
  }, [
    allFeatures,
    yearsFilter,
    statusesFilter,
    inspectFilter,
    resolutionFilter,
    priorityFilter,
    councilFilter,
  ]);

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filteredFeatures.length);
    }
  }, [filteredFeatures, onCountChange]);

  useEffect(() => {
    if (typeof onSummaryChange !== "function") return;

    const buildCounts = (field, selectedValues) => {
      if (!selectedValues?.length) return null;
      return selectedValues.map((value) => {
        const count = filteredFeatures.filter((feat) => {
          const prop = feat.properties?.[field];
          return String(prop) === String(value);
        }).length;
        return { value, count };
      });
    };

    const summary = {};
    const yearCounts = buildCounts("violation_year", yearsFilter);
    if (yearCounts) summary.YEARS = yearCounts;
    const statusCounts = buildCounts("casestatus", statusesFilter);
    if (statusCounts) summary.STATUSES = statusCounts;
    const inspectCounts = buildCounts("inspect_district", inspectFilter);
    if (inspectCounts) summary.INSPECTDIST = inspectCounts;
    const resolutionCounts = buildCounts(
      "violationresolutioncode",
      resolutionFilter
    );
    if (resolutionCounts) summary.RESOLUTIONCODE = resolutionCounts;
    const priorityCounts = buildCounts("caseprioritydesc", priorityFilter);
    if (priorityCounts) summary.PRIORITY = priorityCounts;

    onSummaryChange(summary);
  }, [
    filteredFeatures,
    yearsFilter,
    statusesFilter,
    inspectFilter,
    resolutionFilter,
    priorityFilter,
    onSummaryChange,
  ]);

  const filtered = useMemo(
    () => ({
      type: "FeatureCollection",
      features: filteredFeatures.slice(0, 25000),
    }),
    [filteredFeatures]
  );

  const selectedKey = getFeatureKey(selectedFeature);

  const pointToLayer = (feature, latlng) => {
    const featureKey = getFeatureKey(feature);
    const isSelected = selectedKey && selectedKey === featureKey;

    if (selectedKey && !isSelected) {
      return null;
    }

    const layers = [];
    const baseRadius = 5;
    const fadedOpacity = 1;

    layers.push(
      L.circleMarker(latlng, {
        radius: baseRadius + 2,
        fillColor: "rgba(17,24,39,0.35)",
        color: "rgba(249,115,22,0.25)",
        weight: 1,
        opacity: fadedOpacity,
        fillOpacity: 0.5 * fadedOpacity,
      })
    );

    layers.push(
      L.circleMarker(latlng, {
        radius: baseRadius,
        fillColor: "#111827",
        color: "#f97316",
        weight: isSelected ? 1.6 : 1,
        opacity: isSelected ? 1 : fadedOpacity,
        fillOpacity: isSelected ? 0.95 : 0.9 * fadedOpacity,
      })
    );

    const rings = [
      yearsFilter.length && FILTER_COLORS.YEARS,
      statusesFilter.length && FILTER_COLORS.STATUSES,
      inspectFilter.length && FILTER_COLORS.INSPECTDIST,
      resolutionFilter.length && FILTER_COLORS.RESOLUTIONCODE,
      priorityFilter.length && FILTER_COLORS.PRIORITY,
    ].filter(Boolean);

    rings.forEach((color, idx) => {
      layers.push(
        L.circleMarker(latlng, {
          radius: Math.max(1.2, (isSelected ? 4.2 : 3) - idx * 0.6),
          fillColor: color,
          color,
          weight: 1,
          opacity: fadedOpacity,
          fillOpacity: 0.9 * fadedOpacity,
        })
      );
    });

    layers.push(
      L.circleMarker(latlng, {
        radius: isSelected ? 1.5 : 1,
        fillColor: isSelected ? "#fff" : "#f97316",
        color: "transparent",
        opacity: fadedOpacity,
        fillOpacity: fadedOpacity,
      })
    );

    return L.featureGroup(layers);
  };

  const handleFeature = (feature, layer) => {
    const props = feature.properties || {};
    layer.bindPopup(
      `<div><strong>Property Information</strong></div>
       Year Filed: ${props.violation_year ?? "N/A"}<br/>
       Council District: ${props.council_district ?? "N/A"}<br/>
       L&I Inspection District: ${props.inspect_district ?? "N/A"}<br/>
       Tract: ${props.censustract ?? "N/A"}<br/>
       Case Status: ${props.casestatus ?? "N/A"}<br/>
       Priority: ${props.caseprioritydesc ?? "N/A"}<br/>
       Violation Resolution Status: ${props.violationresolutioncode ?? "N/A"}<br/>
       Subcode: ${props.subcode ?? "N/A"}<br/>
       Violation Class: ${props.viol_class ?? "N/A"}<br/>`
    );

    layer.on("popupopen", () => layer.closePopup());

    if (typeof onFeatureSelect === "function") {
      layer.on("click", () => onFeatureSelect(feature));
    }
  };

  return (
    <GeoJSON
      key={`violations-${filteredFeatures.length}-${selectedKey ?? "none"}`}
      data={filtered}
      pointToLayer={pointToLayer}
      onEachFeature={handleFeature}
    />
  );
}
