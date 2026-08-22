import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { afterEach, beforeEach } from "vitest";
import { cleanupTestUserData, TEST_USER_IDS } from "./testDataIsolation";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const TEST_USER_ID = TEST_USER_IDS.features;

beforeEach(async () => cleanupTestUserData(TEST_USER_ID));
afterEach(async () => cleanupTestUserData(TEST_USER_ID));

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: TEST_USER_ID,
    openId: "omnimatrix-test-features",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("QA Pro Core Features", () => {
  describe("Dashboard Stats", () => {
    it("should return dashboard statistics", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const stats = await caller.dashboard.stats();

      expect(stats).toBeDefined();
      expect(typeof stats.totalScripts).toBe("number");
      expect(typeof stats.totalProfiles).toBe("number");
      expect(typeof stats.totalExecutions).toBe("number");
      expect(typeof stats.runningInstances).toBe("number");
      expect(typeof stats.successRate).toBe("number");
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);
    });
  });

  describe("Script Management", () => {
    it("should create a new script", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const script = await caller.scripts.create({
        name: "Test Automation Script",
        description: "Test script for vitest",
        nodes: [
          { id: "node1", type: "navigate", position: { x: 0, y: 0 }, data: { url: "https://example.com" } },
          { id: "node2", type: "click", position: { x: 0, y: 100 }, data: { selector: "#submit" } },
        ],
        edges: [{ id: "edge1", source: "node1", target: "node2" }],
      });

      expect(script).toBeDefined();
      expect(script.id).toBeDefined();
      expect(typeof script.id).toBe("number");
    });

    it("should list all scripts", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const scripts = await caller.scripts.list();

      expect(Array.isArray(scripts)).toBe(true);
    });
  });

  describe("Profile Management", () => {
    it("should create a new profile", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const profile = await caller.profiles.create({
        name: "Test Profile",
        platform: "twitter",
        proxyHost: "proxy.example.com",
        proxyPort: 8080,
      });

      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
      expect(typeof profile.id).toBe("number");
    });

    it("should list all profiles", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const profiles = await caller.profiles.list();

      expect(Array.isArray(profiles)).toBe(true);
    });
  });

  describe("Execution Management", () => {
    it("should list executions with limit", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const executions = await caller.executions.list({ limit: 10 });

      expect(Array.isArray(executions)).toBe(true);
      expect(executions.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Container Management", () => {
    it("should create a new container", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const container = await caller.containers.create({
        name: "Test Container",
        host: "192.168.1.100",
        port: 5900,
      });

      expect(container).toBeDefined();
      expect(container.id).toBeDefined();
      expect(typeof container.id).toBe("number");
    });

    it("should list all containers", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const containers = await caller.containers.list();

      expect(Array.isArray(containers)).toBe(true);
    });
  });

  describe("Template Management", () => {
    it("should list all templates", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const templates = await caller.templates.list();

      expect(Array.isArray(templates)).toBe(true);
    });
  });
});
