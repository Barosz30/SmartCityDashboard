import type { CityAlert, SensorReading, SensorType } from "./types";

const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 };

export function filterReadings(
  readings: SensorReading[],
  layer: SensorType,
  zone: string,
  timeWindowHours: number,
  nowMs = Date.now(),
): SensorReading[] {
  return readings.filter((item) => {
    const inLayer = item.type === layer;
    const inZone = zone === "all" || item.zoneId === zone;
    const inRange = nowMs - new Date(item.timestamp).getTime() <= timeWindowHours * 60 * 60 * 1000;
    return inLayer && inZone && inRange;
  });
}

export function getAverageMetric(readings: SensorReading[]): string {
  if (readings.length === 0) return "-";
  const avg = readings.reduce((acc, item) => acc + item.value, 0) / readings.length;
  return `${avg.toFixed(1)} ${readings[0].unit}`;
}

export function getTopAlert(alerts: CityAlert[]): CityAlert | undefined {
  return [...alerts].sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity])[0];
}

export function buildTrendPoints(series: SensorReading[]): string {
  const maxY = Math.max(...series.map((item) => item.value), 1);
  return series
    .map((item, i) => {
      const x = (i / Math.max(series.length - 1, 1)) * 100;
      const y = 100 - (item.value / maxY) * 100;
      return `${x},${y}`;
    })
    .join(" ");
}
