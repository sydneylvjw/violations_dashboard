import { readFile, writeFile } from "node:fs/promises";

const raw = JSON.parse(await readFile("public/data/inspectPanel.json", "utf8"));
const keepKeys = new Set([
  "violation_year",
  "council_district",
  "censustract",
  "inspect_district",
  "casestatus",
  "caseprioritydesc",
  "violationresolutioncode",
  "subcode",
  "viol_class",
  "address",
]);

const trimmed = {
  type: raw.type,
  name: raw.name,
  crs: raw.crs,
  features: raw.features.map((feat) => ({
    type: feat.type,
    geometry: feat.geometry,
    properties: Object.fromEntries(
      Object.entries(feat.properties).filter(([k]) => keepKeys.has(k))
    ),
  })),
};

await writeFile(
  "public/data/violations_small.json",
  JSON.stringify(trimmed)
);
console.log("Wrote", trimmed.features.length, "features to public/data/violations_small.json");
