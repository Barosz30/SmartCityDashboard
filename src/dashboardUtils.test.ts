import { describe, expect, it } from "vitest";
import { buildTrendPoints, filterReadings, getAverageMetric, getTopAlert } from "./dashboardUtils";
import type { CityAlert, SensorReading } from "./types";

const baseReadings: SensorReading[] = [
  {
    sensorId: "S-1",
    type: "air",
    lat: 50.1,
    lng: 19.1,
    timestamp: "2026-04-08T10:00:00.000Z",
    value: 50,
    unit: "AQI",
    qualityFlag: "good",
    zoneId: "Z-01",
  },
  {
    sensorId: "S-2",
    type: "air",
    lat: 50.1,
    lng: 19.1,
    timestamp: "2026-04-08T01:00:00.000Z",
    value: 70,
    unit: "AQI",
    qualityFlag: "good",
    zoneId: "Z-02",
  },
  {
    sensorId: "S-3",
    type: "traffic",
    lat: 50.1,
    lng: 19.1,
    timestamp: "2026-04-08T11:00:00.000Z",
    value: 40,
    unit: "veh/min",
    qualityFlag: "good",
    zoneId: "Z-01",
  },
];

describe("dashboardUtils", () => {
  it("filters readings by layer, zone, and time window", () => {
    const now = new Date("2026-04-08T12:00:00.000Z").getTime();
    const result = filterReadings(baseReadings, "air", "Z-01", 3, now);
    expect(result).toHaveLength(1);
    expect(result[0]?.sensorId).toBe("S-1");
  });

  it("returns average metric with unit", () => {
    expect(getAverageMetric(baseReadings.slice(0, 2))).toBe("60.0 AQI");
    expect(getAverageMetric([])).toBe("-");
  });

  it("selects the highest severity alert", () => {
    const alerts: CityAlert[] = [
      {
        alertId: "AL-1",
        severity: "medium",
        category: "air",
        location: "a",
        zoneId: "Z-01",
        status: "open",
        createdAt: "2026-04-08T11:00:00.000Z",
        title: "Medium",
      },
      {
        alertId: "AL-2",
        severity: "critical",
        category: "energy",
        location: "b",
        zoneId: "Z-02",
        status: "open",
        createdAt: "2026-04-08T11:10:00.000Z",
        title: "Critical",
      },
    ];
    expect(getTopAlert(alerts)?.alertId).toBe("AL-2");
  });

  it("builds svg points for trend chart", () => {
    const result = buildTrendPoints(baseReadings.slice(0, 2));
    expect(result).toContain("0,");
    expect(result).toContain("100,");
  });
});
