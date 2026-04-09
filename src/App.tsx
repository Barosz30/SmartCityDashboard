import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import { zonesGeoJson } from "./mockData";
import type { CityAlert, SensorReading, SensorType } from "./types";
import { buildTrendPoints, filterReadings, getAverageMetric, getTopAlert } from "./dashboardUtils";
import { translations, type Locale } from "./i18n";

function localizeAlertTitle(title: string, locale: Locale, sensorLabels: Record<SensorType, string>) {
  const known: Record<string, { en: string; pl: string }> = {
    "AQI over threshold": { en: "AQI over threshold", pl: "AQI powyżej progu" },
    "Congestion spike": { en: "Congestion spike", pl: "Nagły wzrost korków" },
    "Unexpected consumption jump": { en: "Unexpected consumption jump", pl: "Nieoczekiwany skok zużycia" },
  };

  const realtimeMatch = /^Realtime (air|traffic|noise|energy) anomaly$/i.exec(title);
  if (realtimeMatch) {
    const sensorType = realtimeMatch[1].toLowerCase() as SensorType;
    return locale === "pl" ? `Wykryto odchylenie: ${sensorLabels[sensorType]}` : `Deviation detected: ${sensorLabels[sensorType]}`;
  }

  return known[title]?.[locale] ?? title;
}

function formatWindowLabel(hours: number, locale: Locale) {
  if (hours % 24 === 0 && hours >= 24) {
    const days = hours / 24;
    return locale === "pl" ? `${days}d` : `${days}d`;
  }
  return `${hours}h`;
}

function kpiValue(label: string, value: string, delta: string) {
  return (
    <article className="kpi-card">
      <p>{label}</p>
      <h3>{value}</h3>
      <span>{delta}</span>
    </article>
  );
}

export default function App() {
  const [locale, setLocale] = useState<Locale>("en");
  const [layer, setLayer] = useState<SensorType>("air");
  const [zone, setZone] = useState<string>("all");
  const [timeWindow, setTimeWindow] = useState(24);
  const [alertFilter, setAlertFilter] = useState<CityAlert["status"] | "all">("all");
  const [selectedZone, setSelectedZone] = useState("Z-01");
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<CityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLayerOpen, setIsLayerOpen] = useState(false);
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const layerDropdownRef = useRef<HTMLDivElement | null>(null);
  const zoneDropdownRef = useRef<HTMLDivElement | null>(null);
  const t = translations[locale];
  const sensorLabels: Record<SensorType, string> = t.sensorLabels;
  const quickRanges = [1, 6, 24, 168];

  useEffect(() => {
    async function loadInitialData() {
      try {
        const to = new Date().toISOString();
        const from = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const [historyRes, alertsRes] = await Promise.all([
          fetch(`/api/readings/history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
          fetch("/api/alerts"),
        ]);

        if (!historyRes.ok || !alertsRes.ok) {
          throw new Error("Failed to fetch initial data");
        }

        const historyData = (await historyRes.json()) as SensorReading[];
        const alertsData = (await alertsRes.json()) as CityAlert[];
        setReadings(historyData);
        setAlerts(alertsData);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData().catch(() => {
      setLoading(false);
    });

    const events = new EventSource("/api/events");
    events.addEventListener("sensor.update", (evt) => {
      const payload = JSON.parse((evt as MessageEvent).data) as SensorReading;
      setReadings((prev) => [...prev.slice(-499), payload]);
    });
    events.addEventListener("alert.created", (evt) => {
      const payload = JSON.parse((evt as MessageEvent).data) as CityAlert;
      setAlerts((prev) => [payload, ...prev]);
    });
    events.addEventListener("alert.updated", (evt) => {
      const payload = JSON.parse((evt as MessageEvent).data) as CityAlert;
      setAlerts((prev) => prev.map((item) => (item.alertId === payload.alertId ? payload : item)));
    });

    return () => events.close();
  }, []);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (layerDropdownRef.current && !layerDropdownRef.current.contains(event.target as Node)) {
        setIsLayerOpen(false);
      }
      if (zoneDropdownRef.current && !zoneDropdownRef.current.contains(event.target as Node)) {
        setIsZoneOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const recentReadings = useMemo(() => {
    return filterReadings(readings, layer, zone, timeWindow);
  }, [layer, zone, timeWindow, readings]);

  const visibleAlerts = useMemo(
    () => alerts.filter((alert) => (zone === "all" || alert.zoneId === zone) && (alertFilter === "all" || alert.status === alertFilter)),
    [zone, alertFilter, alerts],
  );

  const avgMetric = getAverageMetric(recentReadings);

  const topAlert = getTopAlert(visibleAlerts);
  const series = recentReadings.slice(-20);
  const points = buildTrendPoints(series);

  async function updateAlertStatus(alertId: string, status: CityAlert["status"]) {
    const response = await fetch(`/api/alerts/${alertId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return;
    const updated = (await response.json()) as CityAlert;
    setAlerts((prev) => prev.map((item) => (item.alertId === updated.alertId ? updated : item)));
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-title-row">
          <h1>
            Smart <span className="city-gradient">City</span>
          </h1>
          <div className="lang-switch header-lang-switch">
            <button
              type="button"
              className={locale === "en" ? "lang-btn active" : "lang-btn"}
              onClick={() => setLocale("en")}
              aria-label="Switch language to English"
            >
              <span aria-hidden="true">🇬🇧</span> EN
            </button>
            <button
              type="button"
              className={locale === "pl" ? "lang-btn active" : "lang-btn"}
              onClick={() => setLocale("pl")}
              aria-label="Przełącz język na polski"
            >
              <span aria-hidden="true">🇵🇱</span> PL
            </button>
          </div>
        </div>
        <p>{t.appSubtitle}</p>
        <div className="controls">
          <label>
            {t.layer}
            <div className="custom-select" ref={layerDropdownRef}>
              <button
                type="button"
                className="custom-select-trigger"
                onClick={() => setIsLayerOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isLayerOpen}
              >
                {sensorLabels[layer]}
              </button>
              {isLayerOpen ? (
                <div className="custom-select-menu" role="listbox" aria-label={t.layer}>
                  {Object.entries(sensorLabels).map(([key, labelName]) => (
                    <button
                      key={key}
                      type="button"
                      className={key === layer ? "custom-select-option active" : "custom-select-option"}
                      onClick={() => {
                        setLayer(key as SensorType);
                        setIsLayerOpen(false);
                      }}
                    >
                      {labelName}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </label>
          <label>
            {t.zone}
            <div className="custom-select" ref={zoneDropdownRef}>
              <button
                type="button"
                className="custom-select-trigger"
                onClick={() => setIsZoneOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isZoneOpen}
              >
                {zone === "all" ? t.allZones : zonesGeoJson.features.find((feature) => feature.properties.zoneId === zone)?.properties.name ?? t.allZones}
              </button>
              {isZoneOpen ? (
                <div className="custom-select-menu" role="listbox" aria-label={t.zone}>
                  <button
                    type="button"
                    className={zone === "all" ? "custom-select-option active" : "custom-select-option"}
                    onClick={() => {
                      setZone("all");
                      setIsZoneOpen(false);
                    }}
                  >
                    {t.allZones}
                  </button>
                  {zonesGeoJson.features.map((feature) => (
                    <button
                      key={feature.properties.zoneId}
                      type="button"
                      className={zone === feature.properties.zoneId ? "custom-select-option active" : "custom-select-option"}
                      onClick={() => {
                        setZone(feature.properties.zoneId);
                        setIsZoneOpen(false);
                      }}
                    >
                      {feature.properties.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </label>
          <label>
            {t.timeWindowHours}
            <input type="range" min={1} max={48} value={timeWindow} onChange={(e) => setTimeWindow(Number(e.target.value))} />
            <strong>{formatWindowLabel(timeWindow, locale)}</strong>
            <div className="quick-ranges">
              <span>{t.quickRanges}</span>
              <div className="quick-ranges-list">
                {quickRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    className={timeWindow === range ? "quick-range-btn active" : "quick-range-btn"}
                    onClick={() => setTimeWindow(range)}
                  >
                    {formatWindowLabel(range, locale)}
                  </button>
                ))}
              </div>
            </div>
          </label>
        </div>
      </aside>

      <main className="main">
        <section className="topbar">
          <div className="lang-switch desktop-lang-switch">
            <button
              type="button"
              className={locale === "en" ? "lang-btn active" : "lang-btn"}
              onClick={() => setLocale("en")}
              aria-label="Switch language to English"
            >
              <span aria-hidden="true">🇬🇧</span> EN
            </button>
            <button
              type="button"
              className={locale === "pl" ? "lang-btn active" : "lang-btn"}
              onClick={() => setLocale("pl")}
              aria-label="Przełącz język na polski"
            >
              <span aria-hidden="true">🇵🇱</span> PL
            </button>
          </div>
        </section>
        {loading ? <section className="panel alert-panel">{t.loadingData}</section> : null}
        <section className="kpi-grid">
          {kpiValue(t.activeAlerts, String(visibleAlerts.filter((a) => a.status !== "resolved").length), t.kpiDeltaA)}
          {kpiValue(t.meanResponse, "07m 24s", t.kpiDeltaB)}
          {kpiValue(t.sensorUptime, "99.2%", t.kpiDeltaC)}
          {kpiValue(`${sensorLabels[layer]} ${t.avgSuffix}`, avgMetric, t.kpiDeltaD)}
        </section>

        <section className="panel map-panel">
          <header>
            <h2>{t.mapAndDrilldown}</h2>
            <span>
              {t.selectedZone}: {selectedZone}
            </span>
          </header>
          <div className="zone-grid">
            {zonesGeoJson.features.map((feature) => (
              <button
                key={feature.properties.zoneId}
                className={selectedZone === feature.properties.zoneId ? "zone active" : "zone"}
                onClick={() => setSelectedZone(feature.properties.zoneId)}
              >
                <strong>{feature.properties.name}</strong>
                <small>{feature.properties.district}</small>
              </button>
            ))}
          </div>
          <p className="muted">{t.mapPlaceholder}</p>
        </section>

        <section className="panel chart-panel">
          <header>
            <h2>{t.timeScrubber}</h2>
            <span>
              {t.lastHours} {formatWindowLabel(timeWindow, locale)}
            </span>
          </header>
          <svg viewBox="0 0 100 100" className="line-chart" aria-label={t.trendChartLabel}>
            <polyline fill="none" strokeWidth="2" points={points} />
          </svg>
        </section>

        <section className="panel alert-panel">
          <header>
            <h2>{t.alertCenter}</h2>
            <select value={alertFilter} onChange={(e) => setAlertFilter(e.target.value as CityAlert["status"] | "all")}>
              <option value="all">{t.allStatuses}</option>
              <option value="open">{t.alertStatusLabels.open}</option>
              <option value="acknowledged">{t.alertStatusLabels.acknowledged}</option>
              <option value="resolved">{t.alertStatusLabels.resolved}</option>
            </select>
          </header>
          {topAlert ? (
            <article className={`top-alert ${topAlert.severity}`}>
              <p>{t.highestPriority}</p>
              <h3>{localizeAlertTitle(topAlert.title, locale, sensorLabels)}</h3>
              <span>
                {topAlert.location} • {topAlert.severity.toUpperCase()}
              </span>
            </article>
          ) : null}
          <ul>
            {visibleAlerts.map((alert) => (
              <li key={alert.alertId}>
                <strong>{localizeAlertTitle(alert.title, locale, sensorLabels)}</strong>
                <span>
                  {sensorLabels[alert.category]} • {t.alertStatusLabels[alert.status]} •{" "}
                  {new Date(alert.createdAt).toLocaleTimeString(locale === "pl" ? "pl-PL" : "en-US")}
                </span>
                <div className="row-actions">
                  <button type="button" disabled={alert.status !== "open"} onClick={() => void updateAlertStatus(alert.alertId, "acknowledged")}>
                    {t.acknowledge}
                  </button>
                  <button type="button" disabled={alert.status === "resolved"} onClick={() => void updateAlertStatus(alert.alertId, "resolved")}>
                    {t.resolve}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
