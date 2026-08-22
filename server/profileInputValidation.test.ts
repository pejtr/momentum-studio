import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990022,
      openId: "profile-input-bounds",
      email: "profile-input-bounds@example.test",
      name: "Profile Input Bounds",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("profile input bounds", () => {
  it("rejects invalid proxy ports and oversized sensitive proxy fields before writes", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.profiles.create({ name: "QA Browser", proxyPort: 65_536 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(caller.profiles.update({ id: 1, proxyPassword: "x".repeat(256) })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("rejects oversized and malformed credential maps before sensitive profile writes", async () => {
    const caller = appRouter.createCaller(createContext());
    const excessiveCredentials = Object.fromEntries(
      Array.from({ length: 51 }, (_, index) => [`credential_${index}`, "value"]),
    );

    await expect(caller.profiles.create({
      name: "QA Browser",
      credentials: excessiveCredentials,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.profiles.update({
      id: 1,
      credentials: { "": "value" },
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
