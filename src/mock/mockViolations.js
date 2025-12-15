export const mockViolations = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 1,
        address: "123 Example St",
        year_filed: 2022,
        resolution_status: "Open",
        subcode: "PM" // property maintenance
      },
      geometry: {
        type: "Point",
        coordinates: [-75.17, 39.955]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 2,
        address: "456 Sample Ave",
        year_filed: 2023,
        resolution_status: "Closed",
        subcode: "PM"
      },
      geometry: {
        type: "Point",
        coordinates: [-75.155, 39.955]
      }
    }
  ]
};