# Design Guide (Kyroia / InnerAI-like)

This guide summarizes the visual system used across the app so designers and engineers can keep UI consistent.

## Tokens
- Colors (light):
  - `--primary`: Violet 600 (#7C3AED), `--primaryHover`: Violet 700 (#6D28D9)
  - `--secondary`: Blue 600 (#2563EB), `--secondaryHover`: Blue 700 (#1D4ED8)
  - `--accent`: Sky 500 (#0EA5E9), `--accentHover`: Sky 600 (#0284C7)
  - Backgrounds: `--background` (#fff), `--backgroundSecondary` (#F9FAFB), `--backgroundTertiary` (#F3F4F6)
  - Borders: `--border` (#E5E7EB), `--borderHover` (#D1D5DB)
- Colors (dark):
  - Backgrounds: `--background` (#0F172A), `--backgroundSecondary` (#1E293B), `--backgroundTertiary` (#334155)
  - Borders: `--border` (#3B475C), `--borderHover` (#56657A)
  - Muted: `--muted` (slate-ish), `--muted-foreground` slightly brighter for readability
- Shadows: `--shadow`, `--shadowMd`, `--shadowLg` (use sparingly)
- Radius: `--radius`: 0.75rem (use `rounded-2xl` for cards, `rounded-lg` for controls)

## Components
- Card (default)
  - Class: `rounded-2xl border border-border/60 bg-card shadow-soft`
  - Spacing: `p-4`, headers/footers use `p-4`
- Button
  - Default rounded: `rounded-lg`
  - Sizes: `sm: h-8`, `default: h-9`, `lg: h-10`, `icon: h-9 w-9`
  - Primary: `variant="default"` or `gradient-primary` for CTAs
- Select
  - Trigger: `h-9 rounded-lg` with border + subtle shadow

## Patterns
- Grids: prefer `gap-5` (was 6) for denser layouts; cards with `min-h` for consistency (e.g., models `min-h-[260px]`).
- Tables (dark and light):
  - Header: `font-semibold text-foreground/90`, row height ~44px (`h-11`)
  - Body rows: `odd:bg-background/60 hover:bg-background/70 border-b border-border/60 last:border-b-0`
  - Action icons: `h-8 w-8 rounded-md`, 14px icons preferred in dense rows
- Chips/Badges: outline with `rounded-md bg-background/60`, concise text size
- Chat
  - Timestamps: `text-[10px] opacity-50`, reduce vertical spacing slightly
  - Assistant bubble: `bg-background/70 border border-border/40` for contrast

## Dark Mode
- Increase border contrast slightly vs light for better separation
- Avoid pure blacks for surfaces; prefer slate-like backgrounds
- Keep hover states visible: `hover:bg-background/70` for rows/lists

## Quick Checklist
- [ ] Cards use rounded-2xl + subtle border + soft shadow
- [ ] Controls use rounded-lg; `h-9` height (smaller in dense areas)
- [ ] Descriptions use `text-xs` when space is tight
- [ ] Tables use zebra + hover + visible actions
- [ ] Feature tiles have fixed height and consistent gap
- [ ] Chat timestamps are compact and discreet

## Captures
- Full run: `TEST_EMAIL=... TEST_PASSWORD=... BASE_URL=http://localhost:3025 npm run capture:dashboard`
- Knowledge only: `npm run capture:knowledge`

