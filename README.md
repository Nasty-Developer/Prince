# SaveStreet Dogs

Static website for SaveStreet Dogs: street dog rescue, treatment, feeding and adoption support in India.

- 22 pages: home, shop (`/collar/`), 6 story field notes (`/stories/`), knowledge centre with 12 guides in 11 categories (`/learn/`), sitemap and robots.
- No backend, no build step. Plain HTML, CSS, JS and self-hosted fonts.
- Every action is a WhatsApp deep link to the team (`wa.me/918955438209`). Donations use the UPI QR already in `assets/`.
- Social: Instagram @savestreetdogs18, Facebook (see footer links).

## Deploying on Render (static site)

| Setting | Value |
| --- | --- |
| Service type | Static Site |
| Branch | `main` |
| Build command | *(leave empty)* |
| Publish directory | `.` |

No environment variables, no secrets and no server are required. Push to `main` and Render redeploys automatically.

## Local preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

## Notes

- `vercel.json` only sets cache headers for the favicon set if this is also served from Vercel. Render ignores it.
- The previous Replit/pnpm workspace (React storefront plus Express API) is preserved on the `legacy-replit` branch, so nothing is lost.
