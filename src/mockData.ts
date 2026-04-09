import type { CityAlert, SensorReading, SensorType, ZoneGeoJson } from "./types";

const now = Date.now();
const sensorTypes: SensorType[] = ["air", "traffic", "noise", "energy"];
const units: Record<SensorType, string> = {
  air: "AQI",
  traffic: "veh/min",
  noise: "dB",
  energy: "kWh",
};

export const zonesGeoJson: ZoneGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { zoneId: "Z-01", name: "North Core", district: "North" },
      geometry: { type: "Polygon", coordinates: [[[19.0, 50.1], [19.04, 50.1], [19.04, 50.13], [19.0, 50.13], [19.0, 50.1]]] },
    },
    {
      type: "Feature",
      properties: { zoneId: "Z-02", name: "River Side", district: "Center" },
      geometry: { type: "Polygon", coordinates: [[[19.04, 50.09], [19.08, 50.09], [19.08, 50.12], [19.04, 50.12], [19.04, 50.09]]] },
    },
    {
      type: "Feature",
      properties: { zoneId: "Z-03", name: "South Transit", district: "South" },
      geometry: { type: "Polygon", coordinates: [[[19.01, 50.06], [19.07, 50.06], [19.07, 50.09], [19.01, 50.09], [19.01, 50.06]]] },
    },
  ],
};

export const historicalReadings: SensorReading[] = Array.from({ length: 120 }, (_, i) => {
  const type = sensorTypes[i % sensorTypes.length];
  return {
    sensorId: `S-${(i % 12) + 1}`,
    type,
    lat: 50.07 + ((i % 5) * 0.01),
    lng: 19.01 + ((i % 7) * 0.01),
    timestamp: new Date(now - (119 - i) * 5 * 60 * 1000).toISOString(),
    value: Math.round((40 + (i % 30) * 1.6 + Math.random() * 6) * 10) / 10,
    unit: units[type],
    qualityFlag: i % 19 === 0 ? "warning" : "good",
    zoneId: `Z-0${(i % 3) + 1}`,
  };
});

export const seedAlerts: CityAlert[] = [
  {
    alertId: "AL-1001",
    severity: "high",
    category: "air",
    location: "North Core / Junction 4",
    zoneId: "Z-01",
    status: "open",
    createdAt: new Date(now - 38 * 60 * 1000).toISOString(),
    title: "AQI over threshold",
  },
  {
    alertId: "AL-1002",
    severity: "medium",
    category: "traffic",
    location: "South Transit / Loop A",
    zoneId: "Z-03",
    status: "acknowledged",
    createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
    title: "Congestion spike",
  },
  {
    alertId: "AL-1003",
    severity: "critical",
    category: "energy",
    location: "River Side / Grid 2",
    zoneId: "Z-02",
    status: "open",
    createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
    title: "Unexpected consumption jump",
  },
];
