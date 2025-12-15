// // these are the components to render filterable code violation markers on the map

// import { useMemo } from "react";
// import { GeoJSON } from "react-leaflet";
// import L from "leaflet";
// import councilPanel from "../../data/councilPanel.json";
// import inspectPanel from "../../data/inspectPanel.json";
// import tractPanel from "../../data/tractPanel.json";

// export default function ViolationsLayer({ violationFilters }) {
//   const vf = violationFilters || {};

//   // 1. Merge all panels ONCE (static data)
//   const allFeatures = useMemo(() => {
//     const features = [];
//     if (councilPanel?.features) features.push(...councilPanel.features);
//     if (inspectPanel?.features) features.push(...inspectPanel.features);
//     if (tractPanel?.features) features.push(...tractPanel.features);
//     return features;
//   }, []); // data doesn't change at runtime



//   // 2. Apply filters with useMemo; convert scalar filters to arrays internally
//   const filteredFeatures = useMemo(() => {
//     const YEARS = vf.YEARS; // number or null
//     const STATUSES = Array.isArray(vf.STATUSES) ? vf.STATUSES : [];
//     const INSPECTDIST = vf.INSPECTDIST || null;
//     const RESOLUTIONCODE = vf.RESOLUTIONCODE || null;
//     const PRIORITY = vf.PRIORITY || null;
//     const COUNCILDIST = vf.COUNCILDIST || null;

//       // DEBUG: log a small sample of distinct inspect_district values
//   if (!INSPECTDIST && !YEARS && !STATUSES.length && !RESOLUTIONCODE && !PRIORITY && !COUNCILDIST) {
//     const distinct = new Set();
//     for (let i = 0; i < Math.min(allFeatures.length, 50000); i++) {
//       const d = allFeatures[i].properties?.inspect_district;
//       if (d) distinct.add(d);
//       if (distinct.size >= 20) break; // don't spam console
//     }
//     console.log("Distinct inspect_district values (sample):", Array.from(distinct));
//   }


//     // DEBUG: what filters does this layer actually see?
//     console.log("ViolationsLayer filters:", {
//       YEARS,
//       STATUSES,
//       INSPECTDIST,
//       RESOLUTIONCODE,
//       PRIORITY,
//       COUNCILDIST,
//     });

//     const result = allFeatures.filter((feature) => {
//       const props = feature.properties || {};

//       if (YEARS != null) {
//         const year = props.violation_year;
//         if (String(year) !== String(YEARS)) return false;
//       }

//       if (STATUSES.length) {
//         const status = props.casestatus;
//         if (!STATUSES.includes(String(status))) return false;
//       }

//       if (COUNCILDIST != null) {
//         const cd = props.council_district;
//         if (String(cd) !== String(COUNCILDIST)) return false;
//       }

//       if (INSPECTDIST) {
//         const dist = props.inspect_district;
//         if (dist !== INSPECTDIST) return false;
//       }

//       if (RESOLUTIONCODE) {
//         const code = props.violationresolutioncode;
//         if (String(code) !== String(RESOLUTIONCODE)) return false;
//       }


//       if (PRIORITY) {
//         const priority = props.caseprioritydesc;
//         if (String(priority) !== String(PRIORITY)) return false;
//       }

//       return true;
//     });

//     // DEBUG: how many features survive the filters?
//     console.log(
//       "ViolationsLayer counts:",
//       "total =", allFeatures.length,
//       "filtered =", result.length
//     );

//     return result;
//   }, [
//     allFeatures,
//     vf.YEARS,
//     vf.STATUSES,
//     vf.INSPECTDIST,
//     vf.RESOLUTIONCODE,
//     vf.PRIORITY,
//     vf.COUNCILDIST,
//   ]);


//   // 3. Render markers from filteredFeatures
//   const filtered = useMemo(
//     () => ({
//       type: "FeatureCollection",
//       features: filteredFeatures.slice(0, 2000), // no more than 1000 points so the dashboard runs smoothly
//     }),
//     [filteredFeatures]
//   );

//   const pointToLayer = (feature, latlng) =>
//     L.circleMarker(latlng, {
//       radius: 2,            // small
//       fillColor: "#E04833", // your color
//       color: "#E04833",
//       weight: 0.5,
//       opacity: 1,
//       fillOpacity: 0.9,
//     });

//   const onEachFeature = (feature, layer) => {
//     const p = feature.properties || {};
//     layer.bindPopup(
//       `<strong>${p.address || "Unknown address"}</strong><br/>
//        Year Filed: ${p.violation_year ?? "N/A"}<br/>
//        Council District: ${p.council_district ?? "N/A"}<br/>
//        L&I Inspection District: ${p.inspect_district ?? "N/A"}<br/>
//        Tract: ${p.censustract ?? "N/A"}<br/>
//        Case Status: ${p.casestatus ?? "N/A"}<br/>
//        Priority: ${p.caseprioritydesc ?? "N/A"}<br/>
//        Violation Resolution Status: ${p.violationresolutioncode ?? "N/A"}<br/>
//        Subcode: ${p.subcode ?? "N/A"}<br/>
//        Violation Class: ${p.viol_class ?? "N/A"}<br/>`
//     );
//   };

//   return (
//     <GeoJSON
//       data={filtered}
//       pointToLayer={pointToLayer}
//       onEachFeature={onEachFeature}
//     />
//   );
// }

// //   const limitedFeatures = filteredFeatures.slice(0, 2000); // limit to first 1000 for performance
// //   return (
// //     <>
// //       {limitedFeatures.map((feature, idx) => {
// //         const { geometry, properties: p = {} } = feature;
// //         if (!geometry || geometry.type !== "Point") return null;

// //         const [lng, lat] = geometry.coordinates || [];
// //         if (lat == null || lng == null) return null;

// //         return (
// //           <Marker key={idx} position={[lat, lng]}>
// //             <Popup>
// //               <div>
// //                 <div>
// //                   <strong>{p.address}</strong>
// //                 </div>
// //                 <div>Year: {p.violation_year}</div>
// //                 <div>Council District: {p.council_district}</div>
// //                 <div>Inspection District: {p.inspect_district}</div>
// //                 <div>Tract: {p.censustract}</div>
// //                 <div>Status: {p.casestatus}</div>
// //                 <div>Priority: {p.caseprioritydesc}</div>
// //                 <div>Resolution Code: {p.violationresolutioncode}</div>
// //                 <div>Subcode: {p.subcode}</div>
// //                 <div>Class: {p.viol_class}</div>
// //               </div>
// //             </Popup>
// //           </Marker>
// //         );
// //       })}
// //     </>
// //   );
// // }


