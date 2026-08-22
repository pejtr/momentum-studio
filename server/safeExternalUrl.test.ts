import { describe, expect, it } from "vitest";
import { getSafeExternalUrl } from "../client/src/lib/safeExternalUrl";

describe("getSafeExternalUrl", () => {
  it("accepts HTTP(S) URLs and rejects unsafe or malformed protocols", () => {
    expect(getSafeExternalUrl("https://jobs.example.test/apply")).toBe("https://jobs.example.test/apply");
    expect(getSafeExternalUrl("http://jobs.example.test/apply")).toBe("http://jobs.example.test/apply");
    expect(getSafeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeExternalUrl("data:text/html,unsafe")).toBeNull();
    expect(getSafeExternalUrl("not a url")).toBeNull();
  });
});
