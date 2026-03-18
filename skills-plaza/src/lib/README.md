# Lib

Shared utility functions for formatting, sorting, filtering, and UI helpers.

## Structure

| File | Description |
|------|-------------|
| `utils.ts` | Tailwind helpers plus skill formatting and list transforms |

## Usage

```ts
import { filterSkills, sortSkills } from "@/lib/utils";
```

## Guidelines

- Keep pure helpers here so components stay focused on rendering.
- Prefer immutable transforms and typed utility signatures.
