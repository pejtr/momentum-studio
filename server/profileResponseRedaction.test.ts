import { describe, expect, it } from "vitest";
import { redactProfileSecrets } from "./routers";

describe("profile response redaction", () => {
  it("removes stored proxy passwords and credential maps while retaining configuration signals", () => {
    const response = redactProfileSecrets({
      id: 7,
      name: "QA Profile",
      proxyHost: "proxy.example.test",
      proxyPassword: "sensitive-proxy-password",
      credentials: { token: "sensitive-token" },
    });

    expect(response).toEqual({
      id: 7,
      name: "QA Profile",
      proxyHost: "proxy.example.test",
      hasProxyPassword: true,
      hasCredentials: true,
    });
    expect(response).not.toHaveProperty("proxyPassword");
    expect(response).not.toHaveProperty("credentials");
  });

  it("reports absent secret configuration without adding secret fields", () => {
    const response = redactProfileSecrets({ id: 8, name: "Public shape", proxyPassword: null, credentials: null });

    expect(response.hasProxyPassword).toBe(false);
    expect(response.hasCredentials).toBe(false);
    expect(response).not.toHaveProperty("proxyPassword");
    expect(response).not.toHaveProperty("credentials");
  });
});
