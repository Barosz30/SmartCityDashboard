import type { AlertStatus, SensorType } from "./types";

export type Locale = "en" | "pl";

type TranslationShape = {
  appTitle: string;
  appSubtitle: string;
  language: string;
  layer: string;
  zone: string;
  allZones: string;
  timeWindowHours: string;
  loadingData: string;
  activeAlerts: string;
  meanResponse: string;
  sensorUptime: string;
  avgSuffix: string;
  mapAndDrilldown: string;
  selectedZone: string;
  mapPlaceholder: string;
  timeScrubber: string;
  quickRanges: string;
  lastHours: string;
  trendChartLabel: string;
  alertCenter: string;
  allStatuses: string;
  highestPriority: string;
  acknowledge: string;
  resolve: string;
  kpiDeltaA: string;
  kpiDeltaB: string;
  kpiDeltaC: string;
  kpiDeltaD: string;
  alertStatusLabels: Record<AlertStatus, string>;
  sensorLabels: Record<SensorType, string>;
};

export const translations: Record<Locale, TranslationShape> = {
  en: {
    appTitle: "Smart City",
    appSubtitle: "Command Center",
    language: "Language",
    layer: "Layer",
    zone: "Zone",
    allZones: "All zones",
    timeWindowHours: "Time Window (hours)",
    loadingData: "Loading data...",
    activeAlerts: "Active Alerts",
    meanResponse: "Mean Response",
    sensorUptime: "Sensor Uptime",
    avgSuffix: "Avg",
    mapAndDrilldown: "Map & Zone Drill-down",
    selectedZone: "Selected",
    mapPlaceholder: "Mapbox/Leaflet plug-in point for map layers, markers, heatmap, and legend.",
    timeScrubber: "Trend over time",
    quickRanges: "Quick ranges",
    lastHours: "Last",
    trendChartLabel: "Layer trend chart",
    alertCenter: "Alert Center",
    allStatuses: "All statuses",
    highestPriority: "Highest Priority",
    acknowledge: "Acknowledge",
    resolve: "Resolve",
    kpiDeltaA: "+2 vs 1h",
    kpiDeltaB: "-12%",
    kpiDeltaC: "+0.3%",
    kpiDeltaD: "+4.1%",
    alertStatusLabels: {
      open: "Open",
      acknowledged: "Acknowledged",
      resolved: "Resolved",
    },
    sensorLabels: {
      air: "Air",
      traffic: "Traffic",
      noise: "Noise",
      energy: "Energy",
    },
  },
  pl: {
    appTitle: "Smart City",
    appSubtitle: "Centrum Operacyjne",
    language: "Język",
    layer: "Warstwa",
    zone: "Strefa",
    allZones: "Wszystkie strefy",
    timeWindowHours: "Zakres czasu (godziny)",
    loadingData: "Wczytywanie danych...",
    activeAlerts: "Aktywne alerty",
    meanResponse: "Średni czas reakcji",
    sensorUptime: "Dostępność sensorów",
    avgSuffix: "Średnia",
    mapAndDrilldown: "Mapa i podgląd stref",
    selectedZone: "Wybrana strefa",
    mapPlaceholder: "Tutaj można podpiąć Mapbox/Leaflet z warstwami, markerami, heatmapą i legendą.",
    timeScrubber: "Trend w czasie",
    quickRanges: "Szybkie zakresy",
    lastHours: "Ostatnie",
    trendChartLabel: "Wykres trendu warstwy",
    alertCenter: "Centrum alertów",
    allStatuses: "Wszystkie statusy",
    highestPriority: "Najwyższy priorytet",
    acknowledge: "Potwierdź",
    resolve: "Rozwiąż",
    kpiDeltaA: "+2 vs 1h",
    kpiDeltaB: "-12%",
    kpiDeltaC: "+0.3%",
    kpiDeltaD: "+4.1%",
    alertStatusLabels: {
      open: "Otwarte",
      acknowledged: "Potwierdzone",
      resolved: "Rozwiązane",
    },
    sensorLabels: {
      air: "Powietrze",
      traffic: "Ruch",
      noise: "Hałas",
      energy: "Energia",
    },
  },
};
