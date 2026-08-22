import { describe, expect, it } from "vitest";
import { escapeXml, getSafeSitemapBaseUrl } from "./sitemapRouter";

describe("sitemap output boundaries", () => {
  it("accepts ordinary deployment hosts and rejects malformed host syntax", () => {
    expect(getSafeSitemapBaseUrl("omnimatrix.manus.space")).toBe("https://omnimatrix.manus.space");
    expect(getSafeSitemapBaseUrl("localhost:3000")).toBe("https://localhost:3000");
    expect(getSafeSitemapBaseUrl("evil.test/path")).toBeUndefined();
    expect(getSafeSitemapBaseUrl("user@evil.test")).toBeUndefined();
    expect(getSafeSitemapBaseUrl(" bad.example.test")).toBeUndefined();
  });

  it("escapes XML metacharacters before constructing sitemap locations", () => {
    expect(escapeXml(`a&b<c>d"e'f`)).toBe("a&amp;b&lt;c&gt;d&quot;e&apos;f");
  });
});
