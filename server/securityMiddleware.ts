import type { NextFunction, Request, Response } from "express";

export const JSON_BODY_LIMIT = "24mb";
export const FORM_BODY_LIMIT = "1mb";

export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data: https://fonts.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "script-src 'self' 'unsafe-inline' https://manus-analytics.com",
        "connect-src 'self' https://manus-analytics.com wss:",
      ].join("; ")
    );
  }

  next();
}

export function handleRequestBodyError(
  error: Error & { type?: string },
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (error.type === "entity.too.large") {
    res.status(413).json({
      error: "Payload je příliš velký. Zmenšete soubor nebo vstupní data a zkuste to znovu.",
    });
    return;
  }

  next(error);
}
