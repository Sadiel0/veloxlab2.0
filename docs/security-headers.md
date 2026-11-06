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

Fonts and the hero are self-hosted. There is no third-party script. Booking buttons are normal links to Calendly, not an embed. Lead forms `fetch` JSON from FormSubmit, so `connect-src` has to allow that origin or the browser blocks the POST.

```
default-src 'self';
script-src 'self';
style-src 'self';
font-src 'self';
img-src 'self' data:;
media-src 'self';
connect-src 'self' https://formsubmit.co;
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

`frame-src` stays `'none'` because Calendly is opened as a page, not framed. The forms call `fetch` and never navigate, so `form-action 'self'` still holds. `connect-src` is what lets the ajax POST through.

The only inline script is the JSON-LD block (`type="application/ld+json"`), which CSP does not execute.

## Cache

Files are not content-hashed, so do not mark them immutable. A later build step would be required for fingerprinted assets, and this site does not have one.

| Response | Cache-Control |
| --- | --- |
| `index.html`, `robots.txt`, `sitemap.xml` | `public, max-age=0, must-revalidate` |
| `styles.css`, `js/*`, `favicon.svg`, `assets/*` | `public, max-age=3600` |
| Future `/assets/` files with a hash in the name | `public, max-age=31536000, immutable` |

Turn on compression (brotli or gzip) for HTML, CSS, and JS at the host. The local Python server does not compress, which is why a lab audit flags text compression.
