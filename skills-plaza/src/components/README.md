# Components

Reusable UI building blocks for the `Skills Plaza` interface.

## Structure

| File | Description |
|------|-------------|
| `SkillCard.tsx` | Marketplace card for a single skill |
| `SkillModal.tsx` | Detailed skill briefing modal |
| `SearchAndFilters.tsx` | Search, filter, and sort controls |
| `LoadingStates.tsx` | Loading, error, and empty states |
| `plaza/` | Homepage-specific composition components |

## Usage

```tsx
import { SkillCard } from "@/components/SkillCard";
```

## Guidelines

- Keep generic UI components here and move homepage-only sections into `plaza/`.
- Prefer small, composable components over expanding `page.tsx`.
