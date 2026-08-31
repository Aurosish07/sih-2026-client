# StormSense — Live Cyclone Monitor

A Next.js 16 (App Router) climate/tropical-storm tracking web app. It pulls cyclone
data from multiple providers (**NOAA NHC live**, MOSDAC, IMD, or a local mock),
normalizes it into a single shape, and serves it to a dashboard with a live map of
all cyclones colored by category, a green weather-satellite timeline, trend charts,
forecasts, and a chat assistant.

The app uses a **light color theme** throughout and is client-side only (no backend
required — an optional FastAPI server can be integrated later).

---

## Features

- **Live data pipeline** — storm list + per-storm track, observations, satellite
  imagery, and predictions are normalized from the active provider.
- **Multi-provider live data (default: NOAA NHC)** — live active storms are pulled
  from the NOAA National Hurricane Center feed and merged with a rich dataset of
  15 North Indian Ocean cyclones (Amphan, Fani, Tauktae, Yaas, Mocha, etc.).
- **Provider abstraction with automatic fallback** — switch providers via one env
  var; if the live provider fails, the app gracefully falls back to the historical
  dataset.
- **Interactive all-cyclone map** — live map showing every cyclone in the region,
  colored by category (LOW → SuCS) with a legend and click-to-select. Uses
  **MapLibre GL** when WebGL2 is available, and automatically falls back to a
  **Leaflet** raster map when WebGL2 is not supported (older browsers, some
  embedded webviews, headless environments).
- **Green weather-satellite timeline** — T-2 / T-1 / NOW imagery rendered in a
  green weather-satellite style for the selected storm.
- **Storm dashboard** — category, wind, pressure, movement, and trend cards.
- **Chat assistant** — ask questions about storms; tool calls are displayed inline.

---

## Getting Started

Prerequisites: [Bun](https://bun.sh) (or npm/pnpm/yarn) and Node.js installed.

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

| Script   | Description                    |
| -------- | ------------------------------ |
| `dev`    | Start the development server   |
| `build`  | Production build               |
| `start`  | Run the production build       |
| `lint`   | Run ESLint                     |

---

## Configuration (Environment Variables)

Copy `.env.example` to `.env.local` (create it if it doesn't exist) and adjust as
needed:

```bash
# Backend base URL used by the data-fetching layer (optional)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Active storm provider: noaa | mosdac | imd | mock  (default: noaa)
#   noaa  = live NOAA NHC active-storm feed (no key required) + NIO history
#   mock  = offline dataset of 15 North Indian Ocean cyclones
STORMSENSE_PROVIDER=noaa

# Provider-specific URLs (only needed when using that provider)
MOSDAC_API_URL=https://mosdac.gov.in/api
IMD_API_URL=https://mausam.imd.gov.in/api
```

---

## Architecture

```
External Source (NOAA NHC live / MOSDAC / IMD / Mock)
        │
        ▼
StormSense providers (src/lib/stormsense/providers/*)
        │  normalized
        ▼
StormSense service + data (src/lib/stormsense/*)
        │
        ▼
Next.js API routes (src/app/api/**)
        │  JSON
        ▼
Frontend (pages, dashboard, map, satellite, chat)
```

- **Providers** — `noaa.ts`, `mock.ts`, `mosdac.ts`, `imd.ts` each implement a
  common `StormProvider` interface. `getStormProvider()` selects one from
  `STORMSENSE_PROVIDER` (default `noaa`). The NOAA provider fetches the live NHC
  active-storm feed (with an in-memory TTL cache and a short failure-retry window)
  and merges it with the 15-storm North Indian Ocean dataset in `nio_storms.ts`;
  `withFallback()` retries against the historical dataset if the live fetch fails.
- **API routes** — expose normalized JSON to the frontend.
- **Map** — `src/components/map/CycloneMap.tsx` renders MapLibre GL with every
  cyclone in the region colored by category (radius scaled by wind), a category
  legend, and click-to-select. WebGL2 support is detected up front; when
  unavailable, `LeafletFallbackMap.tsx` renders the same storms as clickable
  colored circle markers using raster tiles (no WebGL required).

---

## API Endpoints

All routes are Next.js API handlers under `src/app/api`.

| Method | Route                                  | Description                        |
| ------ | -------------------------------------- | ---------------------------------- |
| GET    | `/api/storms`                          | List of active storms              |
| GET    | `/api/storms/{id}`                     | Storm detail                       |
| GET    | `/api/storms/{id}/track`               | Historical track points            |
| GET    | `/api/storms/{id}/observations`        | Observations                       |
| GET    | `/api/storms/{id}/satellite`           | Satellite imagery timeline         |
| GET    | `/api/satellite/{stormId}`             | Satellite imagery                  |
| GET    | `/api/satellite/{stormId}/analysis`    | Satellite image analysis           |
| GET    | `/api/predictions/{stormId}`           | Predictions                        |
| GET    | `/api/predictions/{stormId}/trend`     | Prediction trend                   |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: MapLibre GL (WebGL2) with a Leaflet (raster) fallback
- **Charts**: Recharts
- **Package manager**: Bun

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Landing page
│   ├── dashboard/          # Storm dashboard
│   ├── monitor/            # Live map + satellite monitor
│   ├── chat/               # Chat assistant
│   └── api/                # All API routes
├── components/
│   ├── map/                # CycloneMap (MapLibre) + LeafletFallbackMap
│   ├── satellite/          # Satellite imagery timeline
│   ├── dashboard/          # Storm cards, trend charts, forecast panel
│   └── chat/               # Chat panel, message bubbles, tool call display
└── lib/
    ├── stormsense/         # Providers + normalization service
    └── types.ts            # Shared types
```
