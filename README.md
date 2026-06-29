# CM Airlines · Invitación 2027

Single-page invitation app for the CM Airlines launch event. Guests confirm attendance with their ID number; if validated against the guest list, a digital boarding pass is issued (with QR code, calendar export, and printable view).

## Stack

- **Vite** + **React 18** (JS, no TypeScript)
- Inline styles (no CSS framework) to preserve the original design intent
- Self-contained QR generator (`src/lib/qr.js`, public-domain algorithm)
- Static build — deployable to any CDN (Vercel, Netlify, Cloudflare Pages, S3)

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build for production

```bash
npm run build        # outputs static site to dist/
npm run preview      # serve dist/ locally to verify
```

## Manage the guest list

Edit [`src/data/guests.json`](src/data/guests.json):

```json
{
  "guests": [
    { "id": "0502199200553", "nombre": "Oswaldo Sanchez" }
  ]
}
```

ID matching is case-insensitive and ignores dashes, spaces, and non-alphanumeric characters. The official `nombre` from the list is the one printed on the boarding pass.

## Project layout

```
src/
├── App.jsx                 # state machine (check-in ↔ boarding)
├── main.jsx                # React entry
├── index.css               # global styles + animations
├── data/guests.json        # guest list
├── lib/
│   ├── dict.js             # ES/EN translations
│   ├── guests.js           # findGuest() + downloadIcs()
│   └── qr.js               # QR generator
└── components/
    ├── AmbientHero.jsx
    ├── Header.jsx
    ├── CheckinView.jsx
    ├── BoardingView.jsx
    ├── BoardingPass.jsx
    └── RsvpCards.jsx
```
