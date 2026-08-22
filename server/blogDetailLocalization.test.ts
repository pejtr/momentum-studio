import { describe, expect, it } from "vitest";
import { translations } from "../client/src/contexts/LanguageContext";

describe("blog detail localization", () => {
  it("provides Czech-default and English-toggle labels for the full blog detail interaction flow", () => {
    const keys = [
      "blog.backToBlog",
      "blog.postNotFound",
      "blog.draft",
      "blog.views",
      "blog.comments",
      "blog.shareThoughts",
      "blog.posting",
      "blog.postComment",
      "blog.loginToComment",
      "blog.noComments",
    ];

    for (const key of keys) {
      expect(translations.cz[key]).toBeTruthy();
      expect(translations.en[key]).toBeTruthy();
    }
    expect(translations.cz["blog.backToBlog"]).toBe("Zpět na blog");
    expect(translations.en["blog.backToBlog"]).toBe("Back to Blog");
  });
});
