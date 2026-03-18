# Skills Plaza

An editorial-style Next.js marketplace for discovering AI agent skills from the live `skills.sh` ecosystem.

## Overview

- Curated hero section with live ecosystem pulse
- Search, filter, and sorting across the full skill catalog
- Rich skill brief modal with install commands and security detail
- SEO-ready metadata routes for `manifest`, `robots`, and `sitemap`

## Structure

| Path | Purpose |
|------|---------|
| `src/app` | App Router entrypoints and metadata routes |
| `src/components` | Reusable UI components |
| `src/components/plaza` | Homepage-specific composition |
| `src/config` | Brand and SEO configuration |
| `src/lib` | Pure utility functions |
| `src/services` | Remote data fetching and normalization |

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the project locally.

## Quality Checklist

```bash
npm run lint
npm run build
```

## Notes

- Update `NEXT_PUBLIC_SITE_URL` for correct canonical URLs in production.
- Update `NEXT_PUBLIC_API_URL` if the skills API moves to a different host.
