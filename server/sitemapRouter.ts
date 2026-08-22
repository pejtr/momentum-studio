import { Router } from "express";
import * as db from "./db";

export const sitemapRouter = Router();

export function getSafeSitemapBaseUrl(rawHost: string | undefined): string | undefined {
  if (!rawHost || rawHost !== rawHost.trim() || /[\\/@\s]/.test(rawHost)) {
    return undefined;
  }

  try {
    const url = new URL(`https://${rawHost}`);
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      return undefined;
    }
    return `https://${url.host}`;
  } catch {
    return undefined;
  }
}

export function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character] ?? character);
}

sitemapRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = getSafeSitemapBaseUrl(req.get("host"));
    if (!baseUrl) {
      res.status(400).type("text/plain").send("Invalid sitemap host");
      return;
    }

    const posts = await db.getBlogPosts("published");
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${escapeXml(baseUrl)}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Blog Index -->
  <url>
    <loc>${escapeXml(baseUrl)}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Static Pages -->
  <url>
    <loc>${escapeXml(baseUrl)}/marketplace</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${escapeXml(baseUrl)}/documentation</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Blog Posts -->
${posts
  .map(
    (post) => `  <url>
    <loc>${escapeXml(baseUrl)}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date(post.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.type("application/xml").send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});
