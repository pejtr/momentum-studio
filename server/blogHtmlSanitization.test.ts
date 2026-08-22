import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sanitize: vi.fn(() => "<p>Bezpečný obsah</p>"),
}));

vi.mock("dompurify", () => ({
  default: { sanitize: mocks.sanitize },
}));

import { sanitizeBlogHtml } from "../client/src/lib/sanitizeBlogHtml";

describe("blog HTML sanitization", () => {
  it("routes stored article content through the HTML-only sanitizer profile", () => {
    const output = sanitizeBlogHtml('<p>Článek</p><script>alert("xss")</script>');

    expect(output).toBe("<p>Bezpečný obsah</p>");
    expect(mocks.sanitize).toHaveBeenCalledWith('<p>Článek</p><script>alert("xss")</script>', {
      USE_PROFILES: { html: true },
      FORBID_ATTR: ["style"],
    });
  });
});
