import { useEffect, useMemo, useState } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import { normalizeFilterValue, NULL_KEY } from "../../utils/filterUtils";

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

const EMPTY_ARRAY = Object.freeze([]);
const HAZARD_PRIORITY_KEYWORDS = [
  "IMMINENTLY DANGEROUS",
  "IMMINENT DANGER",
  "IMMEDIATELY DANGEROUS",
  "DANGER",
  "HAZARD",
];
const HAZARD_PRIORITY_EXACT = new Set(["IMMINENTLY DANGEROUS", "HAZARDOUS"]);
const OPEN_STATUS_VALUES = new Set(
  [
    "IN VIOLATION",
    "IN VIOLATION - COURT",
    "STOP WORK",
    "SVN ISSUED, BALANCE DUE",
    "UNDER INVESTIGATION",
    "UNSPECIFIED (NO STATUS)",
    "UNRESOLVED (NO STATUS)",
    "OPEN",
    "OPEN CASE",
  ].map((value) => value.toUpperCase())
);
const OPEN_STATUS_KEYWORDS = [
  "VIOLATION",
  "INVESTIGATION",
  "STOP WORK",
  "SVN",
  "BALANCE DUE",
  "UNRESOLVED",
  "UNSPECIFIED",
  "OPEN",
];
const EMPTY_STATS = Object.freeze({
  hazardCount: 0,
  openCount: 0,
  busyDistrict: null,
});

export default function ViolationsLayer({
  violationFilters,
  onSummaryChange,
  onFeatureSelect,
  onCountChange,
  selectedFeature,
  onStatsChange,
  onTotalsChange,
}) {
  const vf = violationFilters || {};
  const yearsFilter = useMemo(
    () => (Array.isArray(vf.YEARS) ? vf.YEARS : EMPTY_ARRAY),
    [vf.YEARS]
  );
  const statusesFilter = useMemo(
    () => (Array.isArray(vf.STATUSES) ? vf.STATUSES : EMPTY_ARRAY),
    [vf.STATUSES]
  );
  const inspectFilter = useMemo(
    () => (Array.isArray(vf.INSPECTDIST) ? vf.INSPECTDIST : EMPTY_ARRAY),
    [vf.INSPECTDIST]
  );
  const resolutionFilter = useMemo(
    () => (Array.isArray(vf.RESOLUTIONCODE) ? vf.RESOLUTIONCODE : EMPTY_ARRAY),
    [vf.RESOLUTIONCODE]
  );
  const priorityFilter = useMemo(
    () => (Array.isArray(vf.PRIORITY) ? vf.PRIORITY : EMPTY_ARRAY),
    [vf.PRIORITY]
  );
  const councilFilter = vf.COUNCILDIST ?? null;
  const hasActiveFilters = Boolean(
    yearsFilter.length ||
      statusesFilter.length ||
      inspectFilter.length ||
      resolutionFilter.length ||
      priorityFilter.length ||
      councilFilter != null
  );

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

  useEffect(() => {
    if (typeof onTotalsChange !== "function") return;
    if (!allFeatures.length) {
      onTotalsChange(null);
      return;
    }

    const totals = computeFilterTotals(allFeatures);
    onTotalsChange(totals);
  }, [allFeatures, onTotalsChange]);

  const filteredFeatures = useMemo(() => {
    if (!hasActiveFilters) return allFeatures;

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
    hasActiveFilters,
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

  const baseStats = useMemo(() => computeStats(allFeatures), [allFeatures]);

  const filteredStats = useMemo(() => {
    if (!hasActiveFilters) return EMPTY_STATS;
    return computeStats(filteredFeatures);
  }, [filteredFeatures, hasActiveFilters]);

  useEffect(() => {
    if (typeof onStatsChange !== "function") return;
    const stats = hasActiveFilters ? filteredStats : baseStats;
    onStatsChange(stats);
  }, [baseStats, filteredStats, hasActiveFilters, onStatsChange]);

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

    const layers = [];
    const baseRadius = 5;
    const fadedOpacity = !selectedKey || isSelected ? 1 : 0.2;

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

    const markerGroup = L.featureGroup(layers);
    markerGroup.on("add", () => {
      if (isSelected) {
        markerGroup.bringToFront();
      }
    });
    return markerGroup;
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

function computeStats(features) {
  if (!Array.isArray(features) || !features.length) {
    return EMPTY_STATS;
  }

  let hazardCount = 0;
  let openCount = 0;
  const districtCounts = new Map();

  features.forEach((feature) => {
    const props = feature.properties || {};
    if (isHazardPriority(props.caseprioritydesc)) {
      hazardCount += 1;
    }
    if (isOpenStatus(props.casestatus)) {
      openCount += 1;
    }
    if (props.inspect_district != null) {
      const key = String(props.inspect_district);
      districtCounts.set(key, (districtCounts.get(key) ?? 0) + 1);
    }
  });

  let busyDistrict = null;
  if (districtCounts.size) {
    const [value, count] = [...districtCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    busyDistrict = { value, count };
  }

  return { hazardCount, openCount, busyDistrict };
}

function computeFilterTotals(features) {
  const totals = {
    YEARS: new Map(),
    STATUSES: new Map(),
    INSPECTDIST: new Map(),
    RESOLUTIONCODE: new Map(),
    PRIORITY: new Map(),
  };

  const increment = (map, rawValue, formatter) => {
    const prepared =
      typeof formatter === "function" ? formatter(rawValue) : rawValue;
    const key = normalizeFilterValue(prepared);
    if (key === NULL_KEY) return;
    map.set(key, (map.get(key) ?? 0) + 1);
  };

  features.forEach((feature) => {
    const props = feature.properties || {};
    increment(totals.YEARS, props.violation_year, (value) => {
      const num = Number(value);
      return Number.isNaN(num) ? null : num;
    });
    increment(totals.STATUSES, props.casestatus);
    increment(totals.INSPECTDIST, props.inspect_district);
    increment(totals.RESOLUTIONCODE, props.violationresolutioncode);
    increment(totals.PRIORITY, props.caseprioritydesc);
  });

  const serialize = (map) => Object.fromEntries(map.entries());

  return {
    YEARS: serialize(totals.YEARS),
    STATUSES: serialize(totals.STATUSES),
    INSPECTDIST: serialize(totals.INSPECTDIST),
    RESOLUTIONCODE: serialize(totals.RESOLUTIONCODE),
    PRIORITY: serialize(totals.PRIORITY),
  };
}

function isHazardPriority(priority) {
  if (priority == null) return false;
  const normalizedPriority = String(priority).trim().toUpperCase();
  if (!normalizedPriority) return false;
  if (HAZARD_PRIORITY_EXACT.has(normalizedPriority)) return true;
  return HAZARD_PRIORITY_KEYWORDS.some((keyword) =>
    normalizedPriority.includes(keyword)
  );
}

function isOpenStatus(status) {
  if (status == null) return true;
  const normalizedStatus = String(status).trim().toUpperCase();
  if (!normalizedStatus) return true;
  if (normalizedStatus === "NULL") return true;
  if (OPEN_STATUS_VALUES.has(normalizedStatus)) return true;
  return OPEN_STATUS_KEYWORDS.some((keyword) =>
    normalizedStatus.includes(keyword)
  );
}
