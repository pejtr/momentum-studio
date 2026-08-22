import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(userId: number | null): TrpcContext {
  return {
    user: userId
      ? {
          id: userId,
          openId: `metrics-test-${userId}`,
          email: `metrics-${userId}@example.test`,
          name: "Metrics Test User",
          loginMethod: "manus",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("system metrics access", () => {
  it("rejects anonymous callers before exposing host metrics", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await expect(caller.metrics.system()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("returns operational capacity metrics without host fingerprinting fields", async () => {
    const caller = appRouter.createCaller(createContext(990014));

    const metrics = await caller.metrics.system();

    expect(metrics).toMatchObject({
      cpu: {
        cores: expect.any(Number),
        loadPercent: expect.any(Number),
        loadAvg: {
          m1: expect.any(Number),
          m5: expect.any(Number),
          m15: expect.any(Number),
        },
      },
      memory: {
        totalMB: expect.any(Number),
        usedMB: expect.any(Number),
        freeMB: expect.any(Number),
        usedPercent: expect.any(Number),
      },
      uptime: {
        seconds: expect.any(Number),
        formatted: expect.any(String),
      },
      timestamp: expect.any(Number),
    });
    expect(metrics).not.toHaveProperty("hostname");
    expect(metrics).not.toHaveProperty("platform");
    expect(metrics).not.toHaveProperty("arch");
    expect(metrics.cpu).not.toHaveProperty("model");
  });
});
