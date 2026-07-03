# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server
npm run build     # production build
npm run preview   # preview the production build locally
```

There is no test suite, linter, or type checker configured in this project.

## Environment

`VITE_API_BASE_URL` (set in `.env`) points at the backend API. All HTTP calls go through the shared axios instance in [src/services/api.js](src/services/api.js).

## Architecture

Linktopus is a Vite + React 18 SPA (JavaScript, no TypeScript) — an AI-assisted LinkedIn post scheduler. Styling is Tailwind (see [tailwind.config.js](tailwind.config.js) for the custom color palette — `ink`, `slate`, `surface`, `primary`, `spark` — and animation keyframes); shared component styles (`.btn-primary`, `.input-field`, `.card`, etc.) are defined in [src/styles/index.css](src/styles/index.css) via `@layer components` rather than repeated Tailwind utility strings.

**Auth**: `AuthProvider` ([src/context/AuthContext.jsx](src/context/AuthContext.jsx)) holds the auth state and persists `access_token` / `refresh_token` / `email` to `localStorage` under `linktopus_*` keys. The axios instance reads the access token from `localStorage` directly in a request interceptor (not from context), so any code making API calls outside of React still gets authenticated automatically. `isAuthenticated` is derived by checking `localStorage` for a token on each render, not tracked as separate state. `ProtectedRoute` redirects unauthenticated users to `/login`, preserving the original destination in router state so `Login` can redirect back after sign-in.

**Routing** ([src/App.jsx](src/App.jsx)): route tree has three tiers —
1. `/login` — public.
2. Routes nested under `ProtectedRoute` + `AppLayout` (adds the `Navbar` and page-transition chrome) — the main dashboard shell.
3. Standalone `ProtectedRoute`-only routes like `/post-assistant` that intentionally render outside `AppLayout` because they have their own full-screen header/flow.

Unimplemented nav destinations (`/schedule`, `/drafts`) route to a shared `ComingSoon` placeholder page rather than 404ing or being omitted — check `dashboardFeatures` status (`"active"` vs `"soon"`) before assuming a dashboard tile links to a real page.

**AI Post Assistant** ([src/pages/PostAssistant.jsx](src/pages/PostAssistant.jsx)): a single-turn chat backed by a live generation API, not a scripted wizard. The user types one free-text prompt (e.g. "Create a post about job hunting tips") into the chat input; submitting calls `generatePostVariations` ([src/services/sharePost.js](src/services/sharePost.js)), which `POST`s `{ user_input }` to `/share-post/generate` and returns four `{ variation, post_content }` drafts. Those render as a `PostVariations` grid ([src/components/postAssistant/PostVariations.jsx](src/components/postAssistant/PostVariations.jsx)) of `VariationCard`s below the chat log — each card has its own inline edit toggle (a local `editedText` textarea), a **Share Now** button (`publishPost` → `POST /share-post/publish`), and a **Schedule** button that opens `ScheduleModal` (date-only picker → `schedulePost` → `POST /share-post/schedule-posts`). The header's **Scheduled Posts** button opens `ScheduledPostsModal`, which fetches `GET /share-post/posts` on mount. Page-level `toast` state (rendered by `Toast`) surfaces share/schedule success and failure. There is no fake typing delay for the initial greeting — `isGenerating` reflects the real in-flight request to `/share-post/generate`.

**Data-driven UI**: Dashboard feature tiles ([src/data/dashboardFeatures.js](src/data/dashboardFeatures.js)) are a plain data array consumed by a generic `FeatureCard` renderer — adding a new dashboard tile is a data change, not a component change, unless the new tile needs bespoke UI.

Path aliases are not configured — imports use relative paths (`../../context/AuthContext`, etc.).
