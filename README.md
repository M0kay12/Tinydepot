# TinyDepot

TinyDepot is a React + TypeScript + Vite frontend prototype for small-business inventory management.

## Run locally in VS Code

1. Open this folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Run `npm install` once.
4. Run `npm run dev`.
5. Open the local address printed by Vite (normally `http://localhost:5173/`).

The application is served locally by Vite. It does not need a ChatGPT URL or a hosted website.

## Main files

- `index.html` — HTML document loaded by the browser; contains the root element and page title.
- `src/main.tsx` — React entry point; imports global CSS and mounts the App component into `#root`.
- `src/App.tsx` — Main React application: navigation, inventory pages, forms, state and interactions.
- `src/index.css` — Global CSS and Tailwind CSS v4 setup.
- `src/App.css` — Older stylesheet retained in the project; it is not imported by the current `main.tsx`.
- `src/App.backup.tsx` / `src/App.backup.css` — Previous prototype copies; not used by the running app.
- `vite.config.ts` — Vite and Tailwind plugin configuration.
- `package.json` — Project dependencies and scripts.
- `public/` — Static files served as-is, such as the favicon and icons.

## Included frontend behaviour

- Add, edit, delete, search and view inventory items.
- Record stock-in, stock-out and transfer movements.
- View categories and supplier contacts.
- View low-stock notifications and recent stock activity.
- Export inventory and transaction history as CSV.
- Change store name, currency and dark mode.
- Persist demo data in the current browser using `localStorage`.

## Prototype limitations

- This is a frontend-only demo. Data is stored in the browser on the current device, not in a shared database.
- AI Assistant is intentionally a placeholder and has no AI integration.
- Upgrade is a demonstration screen; it does not process payments.
- Supplier records are local demo contacts; no supplier portal or email integration is connected.
- Financial reports are limited to actual recorded inventory movements; no fabricated revenue or profit figures are displayed.

## Available commands

- `npm run dev` — Start the development server.
- `npm run build` — Type-check and build for production.
- `npm run preview` — Preview the production build.
- `npm run lint` — Run ESLint.
