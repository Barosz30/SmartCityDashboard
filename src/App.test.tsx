import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

class MockEventSource {
  addEventListener = vi.fn();
  close = vi.fn();
}

const historyPayload = [
  {
    sensorId: "S-1",
    type: "air",
    lat: 50.1,
    lng: 19.1,
    timestamp: new Date().toISOString(),
    value: 55,
    unit: "AQI",
    qualityFlag: "good",
    zoneId: "Z-01",
  },
];

const alertsPayload = [
  {
    alertId: "AL-1",
    severity: "high",
    category: "air",
    location: "North Core",
    zoneId: "Z-01",
    status: "open",
    createdAt: new Date().toISOString(),
    title: "AQI over threshold",
  },
];

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (init?.method === "PATCH" && url.includes("/api/alerts/AL-1")) {
          return {
            ok: true,
            json: async () => ({ ...alertsPayload[0], status: "resolved" }),
          } as Response;
        }
        if (url.includes("/api/readings/history")) {
          return {
            ok: true,
            json: async () => historyPayload,
          } as Response;
        }
        if (url.includes("/api/alerts")) {
          return {
            ok: true,
            json: async () => alertsPayload,
          } as Response;
        }
        return { ok: false, json: async () => ({}) } as Response;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("loads API data and renders alert center", async () => {
    render(<App />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "AQI over threshold" })).toBeInTheDocument();
  });

  it("updates alert status when Resolve is clicked", async () => {
    render(<App />);
    await screen.findByRole("button", { name: "Resolve" });
    const resolveButton = screen.getByRole("button", { name: "Resolve" });
    await userEvent.click(resolveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/alerts/AL-1",
        expect.objectContaining({
          method: "PATCH",
        }),
      );
    });
  });
});
