# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FrontSkill — a LeetCode-style platform for frontend coding challenges. Russian-language UI. Currently frontend-only with mock data (no backend yet).

## Tech Stack

- **Nuxt 4** (Vue 3 Composition API, `<script setup lang="ts">`)
- **Tailwind CSS 4** with Nuxt UI v4 (`@nuxt/ui`)
- **Bun** as package manager and Nitro runtime preset
- **CodeMirror 6** via `vue-codemirror` for the code editor
- **Icons**: Lucide via `@iconify-json/lucide` (usage: `i-lucide-*`)

## Commands

```bash
bun install          # Install dependencies (runs nuxt prepare via postinstall)
bun run dev          # Start dev server
bun run build        # Production build
bun run preview      # Preview production build
```

No test runner is configured yet.

## Architecture

### Layouts

- `default.vue` — Main layout with header navigation, footer, mobile hamburger menu
- `auth.vue` — Centered minimal layout for login/register
- `task.vue` — Full-height layout for the code editor workspace

### Key Pages

- `/` — Landing page (hero, features, leaderboard preview)
- `/tasks` — Task list with difficulty/category/status filters and search
- `/tasks/[id]` — Task detail: split view with description panel + CodeMirror editor + test runner
- `/auth/login`, `/auth/register` — Auth forms (placeholder, no backend integration)

### Design System

Defined in `app/styles.css` via Tailwind `@theme` directive:
- **Custom color scales**: `easy` (emerald), `medium` (amber), `hard` (rose), `expert` (violet), `surface` (cool-dark)
- **CSS variables**: tech tag brand colors (`--tag-html`, `--tag-css`, etc.), editor surface tokens, status colors
- **Utility classes**: `.badge-easy/medium/hard/expert`, `.editor-surface`, `.status-dot-*`
- Dark mode supported via `.dark` class overrides

UI theme configured in `app/app.config.ts`: primary = violet, neutral = zinc.

### Conventions

- All components use `<script setup lang="ts">` with Composition API
- Client-only components use `.client.vue` suffix (e.g., `CodeEditor.client.vue`)
- Nuxt UI components throughout: `UButton`, `UInput`, `UCard`, `UIcon`, `UBadge`, `UFormField`, etc.
- Section comments follow the pattern: `// ─── SectionName ───────`
- Responsive design: mobile-first with `hidden md:block` / `lg:hidden` patterns
