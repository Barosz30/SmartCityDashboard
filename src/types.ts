export type SensorType = "air" | "traffic" | "noise" | "energy";
export type Severity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface SensorReading {
  sensorId: string;
  type: SensorType;
  lat: number;
  lng: number;
  timestamp: string;
  value: number;
  unit: string;
  qualityFlag: "good" | "warning" | "bad";
  zoneId: string;
}

export interface CityAlert {
  alertId: string;
  severity: Severity;
  category: SensorType;
  location: string;
  zoneId: string;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
  title: string;
}

export interface ZoneGeoJsonFeature {
  type: "Feature";
  properties: {
    zoneId: string;
    name: string;
    district: string;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface ZoneGeoJson {
  type: "FeatureCollection";
  features: ZoneGeoJsonFeature[];
}
