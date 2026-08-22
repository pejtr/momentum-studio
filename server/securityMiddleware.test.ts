import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { createSlidingWindowRateLimiter } from "./aiRateLimit";
import { applySecurityHeaders, handleRequestBodyError } from "./securityMiddleware";

function createResponse() {
  const headers = new Map<string, string>();
  const res = {
    setHeader: (key: string, value: string) => headers.set(key, value),
  } as unknown as Response;
  return { res, headers };
}

describe("security middleware", () => {
  it("removes technology disclosure and sets baseline browser protections", () => {
    const { res, headers } = createResponse();
    let nextCalled = false;

    applySecurityHeaders(
      { secure: false, headers: {} } as Request,
      res,
      () => { nextCalled = true; }
    );

    expect(nextCalled).toBe(true);
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(headers.get("Strict-Transport-Security")).toBeUndefined();
  });

  it("adds HSTS only for a trusted HTTPS request", () => {
    const { res, headers } = createResponse();

    applySecurityHeaders(
      { secure: true, headers: {} } as Request,
      res,
      () => {}
    );

    expect(headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
  });

  it("returns a safe JSON 413 response for an oversized payload", () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    let nextCalled = false;

    handleRequestBodyError(
      Object.assign(new Error("request entity too large"), { type: "entity.too.large" }),
      {} as Request,
      { status, json } as unknown as Response,
      () => { nextCalled = true; }
    );

    expect(status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith({
      error: "Payload je příliš velký. Zmenšete soubor nebo vstupní data a zkuste to znovu.",
    });
    expect(nextCalled).toBe(false);
  });
});

describe("AI sliding-window rate limiter", () => {
  it("rejects burst traffic and permits a request after the window expires", () => {
    let now = 1_000;
    const limiter = createSlidingWindowRateLimiter({
      windowMs: 10_000,
      maxRequests: 2,
      now: () => now,
    });

    expect(limiter.check("user-1")).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.check("user-1")).toMatchObject({ allowed: true, remaining: 0 });
    expect(limiter.check("user-1")).toMatchObject({ allowed: false, retryAfterSeconds: 10 });

    now += 10_001;
    expect(limiter.check("user-1")).toMatchObject({ allowed: true, remaining: 1 });
  });

  it("keeps users isolated", () => {
    const limiter = createSlidingWindowRateLimiter({ windowMs: 10_000, maxRequests: 1, now: () => 5_000 });

    expect(limiter.check("user-1").allowed).toBe(true);
    expect(limiter.check("user-2").allowed).toBe(true);
    expect(limiter.check("user-1").allowed).toBe(false);
  });
});
