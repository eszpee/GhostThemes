# rss-proxy

Cloudflare Worker that turns the two RSS feeds shown on the peterszasz.com homepage
(LeadTime.tech and The Retrospective podcast) into JSON. It replaced api.rss2json.com,
which started answering with a Cloudflare bot challenge.

- Only the feeds listed in `FEEDS` in `src/index.js` are served. It is not an open proxy.
- The response shape matches rss2json (`{status, items: [{title, link, description, pubDate}]}`).
  All values are escaped plain text, because the theme inserts them with `innerHTML`.
- CORS is allowed for peterszasz.com and `http://localhost:*`. Responses are cached for 15 minutes.
- Deployed at https://peterszasz-rss-proxy.eszpee.workers.dev/. The theme points at it in
  `packages/journal/assets/js/main.js` (`RSS_PROXY_URL`).

This Worker is not deployed by CI. From this folder:

```bash
npx -y wrangler@4 dev      # local, http://localhost:8787/?rss_url=<feed url>
npx -y wrangler@4 deploy   # needs `npx -y wrangler@4 login` once
```
