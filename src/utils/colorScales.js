// this utility function returns a d3 color scale based on the selected acs attribute

// export function getColorScale(variable) {
//   // TODO: return a d3 color scale based on ACS variable
//   return () => "#cccccc"; // placeholder
// }  <-- I don't want to delete this just yet--I think the code below does the same thing but with actual color scales, but I'll leave it until I am completely sure.

// Simple, hand-rolled color scale for now.
// You can swap this for d3-scale later.



const RAMP = ["#664d50", "#b26c62", "#cec073", "#c1cbaf", "#f5f4c2"];

export const getColorScale = (variable, features) => {
  // collect the values for the selected ACS variable
  const values = features
    .map((f) => f.properties?.[variable])
    .filter((v) => typeof v === "number" && !Number.isNaN(v));

  if (!values.length) {
    // return the middle color as the baseline
    return () => RAMP[Math.floor(RAMP.length / 2)];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // prevent division by zero

  return (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "#cccccc"; // default color for invalid / missing values
    }

    const t = (value - min) / range; // normalize to [0, 1]
    // map t into discrete ramp indices 0..RAMP.length-1
    const idx = Math.max(
      0,
      Math.min(RAMP.length - 1, Math.floor(t * (RAMP.length - 1)))
    );
    return RAMP[idx];
  };
};

// Legend bins that match the same ramp
export function getLegendBins(variable, features) {
  const safeFeatures = Array.isArray(features) ? features : [];

  const values = safeFeatures
    .map((f) => f.properties?.[variable])
    .filter((v) => typeof v === "number" && !Number.isNaN(v));

  if (!values.length) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / RAMP.length || 1;

  const bins = [];
  for (let i = 0; i < RAMP.length; i++) {
    const from = min + i * step;
    const to = i === RAMP.length - 1 ? max : min + (i + 1) * step;
    bins.push({
      color: RAMP[i],
      label: `${Math.round(from).toLocaleString()} – ${Math.round(
        to
      ).toLocaleString()}`,
    });
  }
  return bins;
}
