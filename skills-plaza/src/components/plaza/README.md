# Plaza Components

Homepage-specific presentation components for the curated skills marketplace.

## Structure

| File | Description |
|------|-------------|
| `SkillsPlazaClient.tsx` | Client orchestration for filtering, modal state, and refresh |
| `HeroSection.tsx` | Editorial hero and live pulse summary |
| `SpotlightDeck.tsx` | Curated highlight cards derived from live data |

## Usage

```tsx
import { SkillsPlazaClient } from "@/components/plaza/SkillsPlazaClient";
```

## Guidelines

- Keep this folder focused on the homepage experience only.
- Pass already-shaped data into these components when possible to avoid duplicated calculations.
