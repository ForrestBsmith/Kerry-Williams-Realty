# Dynamic Buyer Guide Flipbook

A lightweight, data-driven flipbook that lets you create multiple branded buyer guides from one codebase.
This version uses `StPageFlip` for more realistic page-turn physics.

## Run locally

From this folder:

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173/?book=onwardBuyerGuide`

Note: internet is required to load the `StPageFlip` browser bundle from jsDelivr.

## How dynamic branding works

All content and theme tokens live in [`data/books.js`](./data/books.js):

- `books.<key>.label`: appears in template dropdown
- `books.<key>.branding`: brand name, logo mark, title, CSS variables
- `books.<key>.spreads`: array of spreads, each with `left` + `right` page content

No HTML edits are required to create a new branded guide.

## Create another branded book

1. Duplicate one book object in `data/books.js`.
2. Change `key`, `label`, and `branding` values.
3. Replace each spread's `title`, `body`, `bullets`, and `image` fields.
4. Open with `?book=<yourKey>` or choose it in the dropdown.

## Schema example

```js
sampleBook: {
  key: "sampleBook",
  label: "Sample - Buyer Guide",
  branding: {
    brandName: "SAMPLE REALTY",
    logoText: "SR",
    title: "Buyer Guide",
    cssVars: {
      "--brand-primary": "#123456",
      "--brand-secondary": "#99c9d3",
      "--brand-accent": "#de845f",
      "--ink": "#1a1f22",
      "--paper": "#f8f5ef",
      "--bg": "#dfe6ea",
      "--font-heading": '"Bitter", Georgia, serif',
      "--font-body": '"Public Sans", "Segoe UI", sans-serif'
    }
  },
  spreads: [
    {
      left: { title: "Page A", body: "Copy...", image: "https://..." },
      right: { title: "Page B", bullets: ["One", "Two"] }
    }
  ]
}
```

## Notes

- Arrow keys: next/previous spread.
- Responsive behavior is handled by `StPageFlip` (landscape + portrait modes).
- This is static-friendly and can be hosted on Netlify/Vercel/GitHub Pages.

## Host On Subdomain (Cloudflare Pages)

Target domain: `guided-book.forrestsmith.tech`

1. Push this folder to a GitHub repo.
2. In Cloudflare Dashboard: `Workers & Pages` -> `Create` -> `Pages` -> `Connect to Git`.
3. Select the repo and use:
   - Framework preset: `None`
   - Build command: *(leave blank)*
   - Build output directory: `/` (root)
4. Deploy.
5. In the new Pages project: `Custom domains` -> `Set up a custom domain`.
6. Enter `guided-book.forrestsmith.tech` and confirm.
7. If prompted, approve DNS record creation (Cloudflare will create/update the needed CNAME).

After DNS propagates, your team can use:

`https://guided-book.forrestsmith.tech/?book=onwardBuyerGuide`

## Fast Styling Workflow

To avoid CSS override conflicts, tune page 2 and page 3 from variables in [`styles.css`](./styles.css) under `:root`:

- Page 2 (Promise): variables prefixed with `--p2-`
- Page 3 (Introduction): variables prefixed with `--p3-`

Common controls:

- `--p2-col-shift-x`: horizontal alignment for promise title/signatures/team heading
- `--p2-title-size`: promise title size
- `--p2-photo-h`: promise image height
- `--p2-team-h3-top`: vertical offset for promise team heading
- `--p2-team-list-size`: promise team list text size
- `--p3-copy-y`: move intro text panel up/down
- `--p3-h2-size`: intro heading size
- `--p3-p-size`: intro paragraph size
- `--p3-ul-size`: intro bullet size

Workflow:

1. Change variable values first.
2. Hard refresh (`Ctrl+F5`).
3. Only add new selectors if a variable cannot solve the layout need.
