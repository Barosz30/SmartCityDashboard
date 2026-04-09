import { test, expect } from '@playwright/test';

type AlertStatus = 'open' | 'acknowledged' | 'resolved';

type TestAlert = {
  alertId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'air' | 'traffic' | 'noise' | 'energy';
  location: string;
  zoneId: string;
  status: AlertStatus;
  createdAt: string;
  title: string;
};

type Reading = {
  sensorId: string;
  type: 'air' | 'traffic' | 'noise' | 'energy';
  lat: number;
  lng: number;
  timestamp: string;
  value: number;
  unit: string;
  qualityFlag: 'good' | 'warning';
  zoneId: string;
};

const now = Date.now();

function buildReadings(): Reading[] {
  const types: Array<Reading['type']> = ['air', 'traffic', 'noise', 'energy'];
  const units: Record<Reading['type'], string> = {
    air: 'AQI',
    traffic: 'veh/min',
    noise: 'dB',
    energy: 'kWh',
  };
  return Array.from({ length: 36 }, (_, idx) => {
    const type = types[idx % types.length];
    return {
      sensorId: `S-${idx + 1}`,
      type,
      lat: 50.07,
      lng: 19.01,
      timestamp: new Date(now - (35 - idx) * 5 * 60 * 1000).toISOString(),
      value: 40 + (idx % 10),
      unit: units[type],
      qualityFlag: 'good',
      zoneId: `Z-0${(idx % 3) + 1}`,
    };
  });
}

function buildAlerts(): TestAlert[] {
  return [
    {
      alertId: 'AL-1001',
      severity: 'high',
      category: 'air',
      location: 'North Core / Junction 4',
      zoneId: 'Z-01',
      status: 'open',
      createdAt: new Date(now - 38 * 60 * 1000).toISOString(),
      title: 'AQI over threshold',
    },
    {
      alertId: 'AL-1002',
      severity: 'medium',
      category: 'traffic',
      location: 'South Transit / Loop A',
      zoneId: 'Z-03',
      status: 'acknowledged',
      createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
      title: 'Congestion spike',
    },
    {
      alertId: 'AL-1003',
      severity: 'critical',
      category: 'energy',
      location: 'River Side / Grid 2',
      zoneId: 'Z-02',
      status: 'open',
      createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
      title: 'Unexpected consumption jump',
    },
  ];
}

test.beforeEach(async ({ page }) => {
  const alerts = buildAlerts();
  const readings = buildReadings();

  await page.route('**/api/readings/history**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(readings),
    });
  });

  await page.route('**/api/alerts', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(alerts),
    });
  });

  await page.route('**/api/alerts/*', async (route, request) => {
    if (request.method() !== 'PATCH') {
      await route.fallback();
      return;
    }
    const url = new URL(request.url());
    const alertId = url.pathname.split('/').pop();
    const body = request.postDataJSON() as { status: AlertStatus };
    const target = alerts.find((item) => item.alertId === alertId);
    if (!target) {
      await route.fulfill({ status: 404, body: 'Not found' });
      return;
    }
    target.status = body.status;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(target),
    });
  });

  await page.route('**/api/events', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: '',
      headers: {
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
      },
    });
  });
});

test('renders dashboard with key sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Smart City/i })).toBeVisible();
  await expect(page.getByText('Command Center').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alert Center' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Map & Zone Drill-down' })).toBeVisible();
});

test('switches UI language from English to Polish', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Command Center').first()).toBeVisible();
  await page.getByRole('button', { name: 'Przełącz język na polski' }).first().click();
  await expect(page.getByText('Centrum Operacyjne').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Centrum alertów' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Potwierdź' }).first()).toBeVisible();
});

test('filters alerts by status', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Unexpected consumption jump' })).toBeVisible();
  await expect(page.locator('li strong', { hasText: 'AQI over threshold' })).toBeVisible();
  await expect(page.locator('li strong', { hasText: 'Congestion spike' })).toBeVisible();

  await page.selectOption('select', 'resolved');
  await expect(page.locator('li strong')).toHaveCount(0);

  await page.selectOption('select', 'acknowledged');
  await expect(page.locator('li strong', { hasText: 'Congestion spike' })).toHaveCount(1);
  await expect(page.locator('li strong', { hasText: 'AQI over threshold' })).toHaveCount(0);
});

test('acknowledges and resolves an alert', async ({ page }) => {
  await page.goto('/');

  const firstAcknowledge = page.getByRole('button', { name: 'Acknowledge' }).first();
  await expect(firstAcknowledge).toBeEnabled();
  await firstAcknowledge.click();
  await expect(page.locator('li').first().getByText('Acknowledged')).toBeVisible();

  const firstResolve = page.getByRole('button', { name: 'Resolve' }).first();
  await expect(firstResolve).toBeEnabled();
  await firstResolve.click();
  await expect(page.locator('li').first().getByText('Resolved')).toBeVisible();
});

test('changes active zone from map zone buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Selected: Z-01')).toBeVisible();

  await page.getByRole('button', { name: /River Side/i }).click();
  await expect(page.getByText('Selected: Z-02')).toBeVisible();

  await page.getByRole('button', { name: /South Transit/i }).click();
  await expect(page.getByText('Selected: Z-03')).toBeVisible();
});

test('updates time window using quick ranges', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.quick-range-btn.active', { hasText: '1d' })).toBeVisible();

  await page.getByRole('button', { name: '1h' }).click();
  await expect(page.locator('.quick-range-btn.active', { hasText: '1h' })).toBeVisible();

  await page.getByRole('button', { name: '7d' }).click();
  await expect(page.locator('.quick-range-btn.active', { hasText: '7d' })).toBeVisible();
});
