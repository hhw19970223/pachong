# App

App Router entrypoints, metadata routes, and global styling for `Skills Plaza`.

## Structure

| File | Description |
|------|-------------|
| `layout.tsx` | Global fonts, metadata, JSON-LD, and root shell |
| `page.tsx` | Server entrypoint that fetches initial skills and renders the plaza client |
| `globals.css` | Shared theme tokens, animations, and utility classes |
| `manifest.ts` | Web app manifest metadata route |
| `robots.ts` | Robots metadata route |
| `sitemap.ts` | Sitemap metadata route |

## Usage

```tsx
import Page from "@/app/page";
```

## Guidelines

- Keep SEO and metadata route logic here instead of scattering it across components.
- Keep route files thin and move interactive UI into dedicated components.
