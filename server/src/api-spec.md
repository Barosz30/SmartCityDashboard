# Backend API Specification (MVP)

## Endpoints

- `GET /api/readings/current` -> latest readings for each sensor
- `GET /api/readings/history?from&to&type&zoneId` -> filtered historical readings
- `GET /api/alerts` -> alert list
- `PATCH /api/alerts/:id` -> update alert status
- `GET /api/events` -> SSE stream (`sensor.update`, `alert.created`)

## Event Payloads

### sensor.update

```json
{
  "event": "sensor.update",
  "data": {
    "sensorId": "S-12",
    "type": "air",
    "timestamp": "2026-04-08T11:22:33.000Z",
    "value": 74.1,
    "zoneId": "Z-01"
  }
}
```

### alert.created

```json
{
  "event": "alert.created",
  "data": {
    "alertId": "AL-2001",
    "severity": "high",
    "status": "open",
    "zoneId": "Z-02"
  }
}
```
