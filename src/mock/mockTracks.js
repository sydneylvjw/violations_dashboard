// Very simplified fake GeoJSON, just enough to render
export const mockTracks = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        GEOID: "42101000100",
        median_income: 28000,
        poverty_rate: 0.32,
        "DISTRICT": "5"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-75.18, 39.96],
            [-75.16, 39.96],
            [-75.16, 39.95],
            [-75.18, 39.95],
            [-75.18, 39.96]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        GEOID: "42101000200",
        median_income: 62000,
        poverty_rate: 0.12
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-75.16, 39.96],
            [-75.14, 39.96],
            [-75.14, 39.95],
            [-75.16, 39.95],
            [-75.16, 39.96]
          ]
        ]
      }
    }
  ]
};