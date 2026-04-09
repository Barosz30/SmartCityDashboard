# Data Contracts

## SensorReading

- `sensorId`: unique sensor id
- `type`: `air | traffic | noise | energy`
- `lat`, `lng`: coordinates
- `timestamp`: ISO string
- `value`: numeric reading
- `unit`: metric unit
- `qualityFlag`: `good | warning | bad`
- `zoneId`: zone reference

## CityAlert

- `alertId`: unique alert id
- `severity`: `low | medium | high | critical`
- `category`: sensor category
- `location`: human readable location
- `zoneId`: zone reference
- `status`: `open | acknowledged | resolved`
- `createdAt`: ISO string
- `resolvedAt`: optional ISO string

## GeoJSON Zones

FeatureCollection with:

- `properties.zoneId`
- `properties.name`
- `properties.district`
- `geometry.type = Polygon`
