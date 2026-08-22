import { describe, expect, it } from "vitest";
import {
  decryptProfileSecret,
  decryptProfileSecrets,
  encryptProfileSecret,
  encryptProfileSecrets,
} from "./profileSecrets";

describe("profile secret encryption", () => {
  it("encrypts proxy passwords and credential-map values, then restores them for server-side execution", () => {
    const protectedProfile = encryptProfileSecrets({
      proxyPassword: "proxy-secret",
      credentials: { apiToken: "automation-token", username: "qa-user" },
    });

    expect(protectedProfile.proxyPassword).toMatch(/^omnimatrix-profile:v1:/);
    expect(protectedProfile.proxyPassword).not.toContain("proxy-secret");
    expect(protectedProfile.credentials?.apiToken).toMatch(/^omnimatrix-profile:v1:/);
    expect(protectedProfile.credentials?.apiToken).not.toContain("automation-token");
    expect(decryptProfileSecrets(protectedProfile)).toEqual({
      proxyPassword: "proxy-secret",
      credentials: { apiToken: "automation-token", username: "qa-user" },
    });
  });

  it("keeps legacy plaintext secrets readable while rejecting tampered ciphertext", () => {
    expect(decryptProfileSecret("legacy-plaintext")).toBe("legacy-plaintext");

    const encrypted = encryptProfileSecret("protected-value");
    const tampered = `${encrypted.slice(0, -1)}x`;
    expect(() => decryptProfileSecret(tampered)).toThrow("could not be decrypted");
  });
});
