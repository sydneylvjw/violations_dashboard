// these are the components to render filterable code violation markers on the map
import { useEffect, useMemo, useState } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";

//  defining features to create a gradient for each filter
const FILTER_COLORS = {
  YEARS: "#c1cbaf",
  STATUSES: "#9daaa0",
  INSPECTDIST: "#664d50",
  RESOLUTIONCODE: "#b26c62",
  PRIORITY: "#cec073",
};


// man rendering function
export default function ViolationsLayer({ violationFilters, onSummaryChange }) {

  const vf = violationFilters || {};
  const yearsFilter = Array.isArray(vf.YEARS) ? vf.YEARS : [];
  const statusesFilter = Array.isArray(vf.STATUSES) ? vf.STATUSES : [];
  const inspectFilter = Array.isArray(vf.INSPECTDIST) ? vf.INSPECTDIST : [];
  const resolutionFilter = Array.isArray(vf.RESOLUTIONCODE) ? vf.RESOLUTIONCODE : [];
  const priorityFilter = Array.isArray(vf.PRIORITY) ? vf.PRIORITY : [];
  const councilFilter = vf.COUNCILDIST ?? null;


  // 1. Merge all panels ONCE (static data)
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

  // 2. Apply filters

  const filteredFeatures = useMemo(() => {
    return allFeatures.filter((feature) => {
      const props = feature.properties || {};

      const yearValue = Number(props.violation_year);
      if (
        yearsFilter.length && !yearsFilter.includes(Number.isNaN(yearValue) ? null : yearValue)
      ) return false;


      if (statusesFilter.length && !statusesFilter.includes(String(props.casestatus))) return false;
      if (inspectFilter.length && !inspectFilter.includes(String(props.inspect_district))) return false;
      if (councilFilter != null && String(props.council_district) !== String(councilFilter)) return false;
      if (resolutionFilter.length && !resolutionFilter.includes(String(props.violationresolutioncode))) return false;
      if (priorityFilter.length && !priorityFilter.includes(String(props.caseprioritydesc))) return false;
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


  // summary count effect
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
    const resolutionCounts = buildCounts("violationresolutioncode", resolutionFilter);
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

const pointToLayer = (feature, latlng) => {
  const layers = [];

  // base halo
  layers.push(
    L.circleMarker(latlng, {
      radius: 7,
      fillColor: "rgba(17,24,39,0.35)",
      color: "rgba(249,115,22,0.25)",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6,
    })
  );

  // core marker
  layers.push(
    L.circleMarker(latlng, {
      radius: 4.5,
      fillColor: "#111827",
      color: "#f97316",
      weight: 1.4,
      opacity: 1,
      fillOpacity: 0.95,
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
        radius: Math.max(1.2, 3.6 - idx * 0.6),
        fillColor: color,
        color,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.95,
      })
    );
  });

  // inner dot
  layers.push(
    L.circleMarker(latlng, {
      radius: 1.2,
      fillColor: "#fff",
      color: "transparent",
      opacity: 0.9,
      fillOpacity: 0.9,
    })
  );

  return L.featureGroup(layers);
};

  const onEachFeature = (feature, layer, onFeatureSelect) => {
    const p = feature.properties || {};
    layer.bindPopup(
      `<div><strong>Property Information</strong></div>
       Year Filed: ${p.violation_year ?? "N/A"}<br/>
       Council District: ${p.council_district ?? "N/A"}<br/>
       L&I Inspection District: ${p.inspect_district ?? "N/A"}<br/>
       Tract: ${p.censustract ?? "N/A"}<br/>
       Case Status: ${p.casestatus ?? "N/A"}<br/>
       Priority: ${p.caseprioritydesc ?? "N/A"}<br/>
       Violation Resolution Status: ${p.violationresolutioncode ?? "N/A"}<br/>
       Subcode: ${p.subcode ?? "N/A"}<br/>
       Violation Class: ${p.viol_class ?? "N/A"}<br/>`
    );

    if (typeof onFeatureSelect === "function") {
      layer.on("click", () => onFeatureSelect(feature));
    } 
  };


  return (
    <GeoJSON
      key={`violations-${filteredFeatures.length}`}
      data={filtered}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  );
}

  
//   const summary = {};
//   const yearCounts = buildCounts("violation_year", vf.YEARS);
//   if (yearCounts) summary.YEARS = yearCounts;
//   const statusCounts = buildCounts("casestatus", vf.STATUSES);
//   if (statusCounts) summary.STATUSES = statusCounts;
//   const inspectCounts = buildCounts("inspect_district", vf.INSPECTDIST);
//   if (inspectCounts) summary.INSPECTDIST = inspectCounts;
//   const resolutionCounts = buildCounts("violationresolutioncode", vf.RESOLUTIONCODE);
//   if (resolutionCounts) summary.RESOLUTIONCODE = resolutionCounts;
//   const priorityCounts = buildCounts("caseprioritydesc", vf.PRIORITY);
//   if (priorityCounts) summary.PRIORITY = priorityCounts;

//   onSummaryChange(summary);
// }, [filteredFeatures, vf, onSummaryChange]);


//   // 3. Render markers from filteredFeatures (cap for performance)
//   const filtered = useMemo(
//     () => ({
//       type: "FeatureCollection",
//       features: filteredFeatures.slice(0, 25000),
//     }),
//     [filteredFeatures]
//   );

// const pointToLayer = (feature, latlng) => {
//   const layers = [];
//   layers.push(
//     L.circleMarker(latlng, {
//       radius: 4,
//       fillColor: "#E04833",
//       color: "#E04833",
//       weight: 0.5,
//       opacity: 1,
//       fillOpacity: 0.9,
//     })
//   );

//   const rings = [
//     yearsFilter.length && FILTER_COLORS.YEARS,
//     statusesFilter.length && FILTER_COLORS.STATUSES,
//     inspectFilter.length && FILTER_COLORS.INSPECTDIST,
//     resolutionFilter.length && FILTER_COLORS.RESOLUTIONCODE,
//     priorityFilter.length && FILTER_COLORS.PRIORITY,
//   ].filter(Boolean);

//   rings.forEach((color, idx) => {
//     layers.push(
//       L.circleMarker(latlng, {
//         radius: Math.max(1.5, 4 - (idx + 1) * 0.6),
//         fillColor: color,
//         color,
//         weight: 1,
//         fillOpacity: 1,
//         opacity: 1,
//       })
//     );
//   });
//   return L.layerGroup(layers);
// };  

// const onEachFeature = (feature, layer) => {
//     const p = feature.properties || {};
//     layer.bindPopup(
//       `<div><strong>Property Information</strong></div>
//       <div class="popup-filters">${vf.STATUSES?.join(", ") || "All statuses"}</div>
//       Year Filed: ${p.violation_year ?? "N/A"}<br/>
//       Council District: ${p.council_district ?? "N/A"}<br/>
//       L&I Inspection District: ${p.inspect_district ?? "N/A"}<br/>
//       Tract: ${p.censustract ?? "N/A"}<br/>
//       Case Status: ${p.casestatus ?? "N/A"}<br/>
//       Priority: ${p.caseprioritydesc ?? "N/A"}<br/>
//       Violation Resolution Status: ${p.violationresolutioncode ?? "N/A"}<br/>
//       Subcode: ${p.subcode ?? "N/A"}<br/>
//       Violation Class: ${p.viol_class ?? "N/A"}<br/>`
//     );
//   };

//   return (
//     <GeoJSON
//       key={`violations-${filteredFeatures.length}`}
//       data={filtered}
//       pointToLayer={pointToLayer}
//       onEachFeature={onEachFeature}
//     />
//   );
// }
