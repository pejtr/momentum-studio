import DOMPurify from "dompurify";

export function sanitizeBlogHtml(content: string): string {
  return DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    FORBID_ATTR: ["style"],
  });
}
