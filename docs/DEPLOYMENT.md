# MITT Website - Deployment Runbook

**Requirement:** a host that runs Node. The enquiry endpoint is a Node route handler, so this site
**cannot** be deployed to static hosting (Netlify static, GitHub Pages, plain shared hosting with no
Node). Any small VPS works: 1 vCPU / 1 GB RAM is enough for this site.

---

## 1. Environment variables

Copy `.env.example` to `.env.production` (or `/etc/mitt-website.env` for systemd) and fill it in.
Never commit that file.

**Build-time (baked into the client bundle - a wrong value here cannot be fixed by restarting):**

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The public origin, e.g. `https://mitt.example.com`. Drives canonicals, sitemap, Open Graph URLs. |

**Runtime:**

| Variable | Meaning |
|---|---|
| `MITT_LEAD_DIR` | Where enquiries are written. Default `./var/enquiries`. Must be writable and backed up. |
| `MITT_NOTIFY_TO` | Comma-separated addresses that receive a new enquiry. **Required for email notification.** |
| `MITT_SMTP_HOST` / `_PORT` / `_SECURE` / `_USER` / `_PASS` / `_FROM` | SMTP delivery. Port defaults to 587; `_SECURE=true` for 465. |
| `MITT_NOTIFY_WEBHOOK` | Alternative to SMTP: an HTTPS endpoint that receives the enquiry as JSON. |
| `MITT_RATE_LIMIT_MAX` / `MITT_RATE_LIMIT_WINDOW_MS` | Defaults 5 and 600000. Per IP, per instance. |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | Optional. Leave unset for no third-party analytics. |

If **neither** SMTP nor webhook is configured the site still accepts enquiries correctly (they persist
and the visitor gets a real reference) but **nobody is told**. `npm run preflight` fails on this.

## 2. First deploy (Docker - recommended)

```bash
git clone <repo> /srv/mitt-website && cd /srv/mitt-website
cp .env.example .env.production && vi .env.production     # fill in, chmod 600

npm ci
npm run test && npm run preflight                          # gate: must pass before going live
docker compose -f deploy/compose.yaml --env-file .env.production up -d --build
docker compose -f deploy/compose.yaml ps                   # health should read (healthy)
```

## 3. First deploy (plain Node + systemd)

```bash
sudo useradd -r -s /usr/sbin/nologin mitt
sudo mkdir -p /srv/mitt-website /var/lib/mitt /etc/mitt-website
sudo chown -R mitt:mitt /srv/mitt-website /var/lib/mitt

git clone <repo> /srv/mitt-website && cd /srv/mitt-website
npm ci && npm run build

sudo cp .env.example /etc/mitt-website.env && sudo chmod 600 /etc/mitt-website.env
sudo vi /etc/mitt-website.env                              # fill in

sudo cp deploy/mitt-website.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now mitt-website
curl -s localhost:3000/api/health | jq
```

## 4. TLS + reverse proxy

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/mitt
sudo ln -s /etc/nginx/sites-available/mitt /etc/nginx/sites-enabled/mitt
sudo certbot --nginx -d mitt.example.com
sudo nginx -t && sudo systemctl reload nginx
```

The nginx config **overwrites** `X-Forwarded-For` with `$remote_addr` on purpose: the app derives its
rate-limit key from that header, and an appended client-supplied value would let anyone bypass the
limit. Keep that line.

## 5. Backups (do this before the site takes real traffic)

The lead store is the only irreplaceable state.

```bash
# daily at 02:15, keep 30 days
15 2 * * * MITT_LEAD_DIR=/var/lib/mitt/enquiries BACKUP_DIR=/var/backups/mitt /srv/mitt-website/scripts/backup-leads.sh >> /var/log/mitt-backup.log 2>&1
```

The script archives, verifies the archive reads back, writes a `.sha256` sidecar, and prunes old
copies. **Copy the archive off the box** - a backup on the same disk does not survive the failure that
matters. Restore is `tar -xzf <archive> -C <lead-dir-parent>`.

## 6. Monitoring

| What | How |
|---|---|
| Liveness | `GET /api/health` returns 200 and `leadStoreWritable: true`. Point an uptime monitor at it. |
| Lead flow | `wc -l /var/lib/mitt/enquiries/*.jsonl` should rise after enquiries. Alert if it never does while traffic exists. |
| TLS expiry | certbot renews automatically; `certbot renew --dry-run` in the first week. |
| Logs | `journalctl -u mitt-website -f` (systemd) or `docker compose logs -f web`. |

Health returning `503` means the lead store is not writable - enquiries are being **rejected**, not
silently dropped. That is deliberate: an enquiry the site cannot store must not be confirmed to the
visitor.

## 7. Updating

```bash
cd /srv/mitt-website
git pull
npm ci
npm run test && npm run build && npm run preflight
sudo systemctl restart mitt-website        # or: docker compose ... up -d --build
curl -s localhost:3000/api/health | jq
```

Roll back with `git checkout <previous-sha> && npm ci && npm run build && systemctl restart`.
The lead store is untouched by a code rollback.

## 8. Go-live sequence

1. `npm run preflight` passes with zero FAIL lines.
2. Legal review signed off and the `DRAFT` chip removed (`site.legalReviewPending = false` in
   `src/content/site.ts`).
3. Real email published in `src/content/site.ts` (`placeholder: false`).
4. Real photography and, if available, permissioned references — see `docs/EVIDENCE-INTAKE.md`.
5. `NEXT_PUBLIC_SITE_URL` set to the live domain, then rebuild (it is baked in).
6. Backups scheduled and verified by an actual restore test.
7. Submit the sitemap in Search Console after the domain resolves.

## 9. Known deployment limitations

- **Rate limiting is per instance, in memory.** One server is fine. Behind a load balancer, move the
  limiter to a shared store or edge WAF.
- **The lead store is a local file.** It is not replicated. Backups are the durability story until a
  database is justified.
- **No CDN assumed.** Static assets already carry immutable caching headers; putting a CDN in front is
  safe and improves LCP for distant visitors.
