# Services

Remote data access and normalization for the live skills feed.

## Structure

| File | Description |
|------|-------------|
| `skillsApi.ts` | Fetches cached or live marketplace data and provides fallback skills |

## Usage

```ts
import { SkillsApiService } from "@/services/skillsApi";
```

## Guidelines

- Keep network handling, fallback behavior, and response normalization in this layer.
- Return clean typed data to UI components instead of leaking raw API shapes.
