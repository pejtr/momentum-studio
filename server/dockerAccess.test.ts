import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role
      ? {
          id: role === "admin" ? 990016 : 990017,
          openId: `docker-access-${role}`,
          email: `docker-${role}@example.test`,
          name: `Docker ${role}`,
          loginMethod: "manus",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Docker privilege boundary", () => {
  it("rejects anonymous callers before Docker inventory is evaluated", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await expect(caller.docker.listContainers({})).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it.each([
    ["host inventory", (caller: ReturnType<typeof appRouter.createCaller>) => caller.docker.listContainers({})],
    ["container lifecycle", (caller: ReturnType<typeof appRouter.createCaller>) => caller.docker.startContainer({ containerId: "qa-runner" })],
    ["container logs", (caller: ReturnType<typeof appRouter.createCaller>) => caller.docker.getContainerLogs({ containerId: "qa-runner", tail: 100 })],
    ["image pull", (caller: ReturnType<typeof appRouter.createCaller>) => caller.docker.pullImage({ image: "nginx:stable" })],
  ])("rejects standard users from %s", async (_operation, invoke) => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(invoke(caller)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects malformed privileged operation input before invoking Docker", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(caller.docker.getContainerLogs({ containerId: "qa-runner", tail: 1_001 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(caller.docker.pullImage({ image: "nginx:stable; rm -rf /" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});
