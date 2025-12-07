## Sheets proxy API

The `src/app/api/sheets-proxy/route.ts` endpoint lets the public site post sign-ins to Google Sheets without hitting the Apps Script URL directly (Apps Script does not support CORS).

### Environment variables

Add the following to your deployment (or `.env.local` for local testing):

```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
SHEETS_ALLOWED_ORIGIN=https://forrestbsmith.github.io
```

- `SHEETS_WEBHOOK_URL` – the Apps Script web-app URL that writes rows into the sheet.
- `SHEETS_ALLOWED_ORIGIN` (optional) – defaults to `https://forrestbsmith.github.io`. Update if the static site moves to a different domain.

### Local testing

1. Create `.env.local` alongside `package.json` with the env variables above.
2. Run `npm run dev`.
3. POST to `http://localhost:3000/api/sheets-proxy` with a JSON body that matches what the static site sends. The route forwards that payload to the Apps Script webhook and responds with the upstream result while attaching the correct CORS headers for the live site.

The static HTML site now points to `https://kwrealty.com/api/sheets-proxy` (see `sheet-config.js`). Once the Next.js app is deployed with the environment variables configured, the browser can submit sign-ins without CORS errors and the proxy relays them to Google Sheets.
