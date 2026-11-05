# Security headers and cache policy

Hosting is not decided (Cloudflare Pages and GoDaddy are both possible). This note is the policy to apply at the host. It is not a deploy config, and this repo has no `_headers`, `netlify.toml`, or server block.

Apply these on every HTML response once the site is on HTTPS:

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | See below |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

Do not send HSTS until the certificate is live on `veloxlab.studio`.

## Content-Security-Policy

The page currently loads Google Fonts, Three.js from jsDelivr, and Lenis from unpkg. The Cal.com embed is not included yet. When that script is added, its origin has to be added here too.

```
default-src 'self';
script-src 'self' https://cdn.jsdelivr.net https://unpkg.com;
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self';
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

`frame-src` stays `'none'` until the Cal.com embed has a known origin. The form does not post anywhere yet, so `form-action 'self'` is enough. Widen it when the owner names the form endpoint.

There is no inline script except the JSON-LD block (`type="application/ld+json"`), which CSP does not execute, and the import map. If a host's CSP build treats the import map as a script, allow `'unsafe-inline'` for `script-src` only as a last resort, or hash that block.

## Cache

Files are not content-hashed, so do not mark them immutable. A later build step would be required for fingerprinted assets, and this site does not have one.

| Response | Cache-Control |
| --- | --- |
| `index.html`, `robots.txt`, `sitemap.xml` | `public, max-age=0, must-revalidate` |
| `styles.css`, `js/*`, `favicon.svg` | `public, max-age=3600` |
| Future `/assets/` files with a hash in the name | `public, max-age=31536000, immutable` |

Turn on compression (brotli or gzip) for HTML, CSS, and JS at the host. The local Python server does not compress, which is why a lab audit flags text compression.
