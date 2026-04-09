import express from "express";
import cors from "cors";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const sensorTypes = ["air", "traffic", "noise", "energy"];
const zones = ["Z-01", "Z-02", "Z-03"];
const units = {
  air: "AQI",
  traffic: "veh/min",
  noise: "dB",
  energy: "kWh",
};

const readings = Array.from({ length: 150 }, (_, i) => {
  const type = sensorTypes[i % sensorTypes.length];
  return {
    sensorId: `S-${(i % 12) + 1}`,
    type,
    lat: 50.07 + ((i % 5) * 0.01),
    lng: 19.01 + ((i % 7) * 0.01),
    timestamp: new Date(Date.now() - (150 - i) * 4 * 60 * 1000).toISOString(),
    value: Math.round((40 + (i % 20) * 1.7 + Math.random() * 5) * 10) / 10,
    unit: units[type],
    qualityFlag: i % 17 === 0 ? "warning" : "good",
    zoneId: zones[i % zones.length],
  };
});

const alerts = [
  {
    alertId: "AL-1001",
    severity: "high",
    category: "air",
    location: "North Core / Junction 4",
    zoneId: "Z-01",
    status: "open",
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    title: "AQI over threshold",
  },
  {
    alertId: "AL-1002",
    severity: "medium",
    category: "traffic",
    location: "South Transit / Loop A",
    zoneId: "Z-03",
    status: "acknowledged",
    createdAt: new Date(Date.now() - 62 * 60 * 1000).toISOString(),
    title: "Congestion spike",
  },
];

const clients = new Set();

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}

app.get("/api/readings/current", (_req, res) => {
  const latestBySensor = new Map();
  for (const item of readings) latestBySensor.set(item.sensorId, item);
  res.json(Array.from(latestBySensor.values()));
});

app.get("/api/readings/history", (req, res) => {
  const { from, to, type, zoneId } = req.query;
  const fromMs = from ? new Date(from).getTime() : Date.now() - 24 * 60 * 60 * 1000;
  const toMs = to ? new Date(to).getTime() : Date.now();

  const filtered = readings.filter((item) => {
    const ts = new Date(item.timestamp).getTime();
    const inRange = ts >= fromMs && ts <= toMs;
    const inType = !type || item.type === type;
    const inZone = !zoneId || item.zoneId === zoneId;
    return inRange && inType && inZone;
  });
  res.json(filtered);
});

app.get("/api/alerts", (_req, res) => {
  res.json(alerts);
});

app.patch("/api/alerts/:id", (req, res) => {
  const alert = alerts.find((entry) => entry.alertId === req.params.id);
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  if (req.body.status) {
    alert.status = req.body.status;
    if (req.body.status === "resolved") {
      alert.resolvedAt = new Date().toISOString();
    }
  }

  broadcast("alert.updated", alert);
  res.json(alert);
});

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write("event: ready\ndata: {}\n\n");
  clients.add(res);
  req.on("close", () => clients.delete(res));
});

setInterval(() => {
  const type = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
  const zoneId = zones[Math.floor(Math.random() * zones.length)];
  const update = {
    sensorId: `S-${Math.floor(Math.random() * 12) + 1}`,
    type,
    lat: 50.07 + Math.random() * 0.04,
    lng: 19.01 + Math.random() * 0.06,
    timestamp: new Date().toISOString(),
    value: Math.round((45 + Math.random() * 40) * 10) / 10,
    unit: units[type],
    qualityFlag: "good",
    zoneId,
  };
  readings.push(update);
  if (readings.length > 400) readings.shift();
  broadcast("sensor.update", update);

  if (Math.random() < 0.2) {
    const created = {
      alertId: `AL-${Math.floor(2000 + Math.random() * 7000)}`,
      severity: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)],
      category: type,
      location: `${zoneId} / Stream`,
      zoneId,
      status: "open",
      createdAt: new Date().toISOString(),
      title: `Realtime ${type} anomaly`,
    };
    alerts.unshift(created);
    if (alerts.length > 40) alerts.pop();
    broadcast("alert.created", created);
  }
}, 5000);

app.listen(port, () => {
  console.log(`Smart City API listening on http://localhost:${port}`);
});
