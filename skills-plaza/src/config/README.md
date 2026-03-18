# Config

Centralized brand, URL, and SEO configuration for `Skills Plaza`.

## Structure

| File | Description |
|------|-------------|
| `site.ts` | Brand name, site metadata, canonical URL, and external links |

## Usage

```ts
import { siteConfig } from "@/config/site";
```

## Guidelines

- Add site-wide metadata and URLs here before referencing them in pages or metadata routes.
- Keep SEO-facing strings in English and avoid scattering URLs across components.
