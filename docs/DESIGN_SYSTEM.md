# Pokédex Design System - Linear-Stripe Hybrid

## Overview

A hybrid design system blending Linear's ultra-minimal density with Stripe's elegant purple accents. The design philosophy: "Don't compete for attention you haven't earned" - elements supporting navigation recede, letting the Pokémon content take center stage.

---

## Visual Theme & Atmosphere

- **Philosophy:** Minimal density with information richness. Calm visual hierarchy where every element earns its weight.
- **Mood:** Professional, precise, yet playful through Pokémon branding
- **Density:** Compact layout - not sparse, but efficient use of space
- **Surfaces:** Subtle surface differentiation through borders, not shadows

---

## Color Palette

### Brand & Accent (Stripe Purple)

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-primary` | `#8b5cf6` | Primary actions, links, active states |
| `--brand-primary-light` | `#a78bfa` | Hover states |
| `--brand-primary-dark` | `#7c3aed` | Pressed states |
| `--brand-accent` | `#6366f1` | Secondary accents |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#10b981` | Success states (emerald green) |
| `--color-warning` | `#f59e0b` | Warning states |
| `--color-danger` | `#ef4444` | Error/delete states |
| `--color-info` | `#3b82f6` | Informational |

### Neutrals (Linear-inspired warm grays)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--gray-50` | `#fafafa` | `#0a0a0a` | Page background |
| `--gray-100` | `#f4f4f4` | `#141414` | Card backgrounds |
| `--gray-200` | `#e4e4e4` | `#1f1f1f` | Borders |
| `--gray-300` | `#d3d3d3` | `#2a2a2a` | Dividers |
| `--gray-400` | `#a1a1a1` | `#404040` | Muted text |
| `--gray-500` | `#737373` | `#525252` | Secondary text |
| `--gray-600` | `#525252` | `#3f3f3f` | Body text (dark mode) |
| `--gray-700` | `#404040` | `#262626` | Primary text (dark mode) |
| `--gray-800` | `#262626` | `#1a1a1a` | Darkest text |
| `--gray-900` | `#171717` | `#0f0f0f` | Near black |

### Pokemon Type Colors

| Type | Color | Token |
|------|-------|-------|
| normal | `#A8A878` | `--type-normal` |
| fire | `#F08030` | `--type-fire` |
| water | `#6890F0` | `--type-water` |
| electric | `#F8D030` | `--type-electric` |
| grass | `#78C850` | `--type-grass` |
| ice | `#98D8D8` | `--type-ice` |
| fighting | `#C03028` | `--type-fighting` |
| poison | `#A040A0` | `--type-poison` |
| ground | `#E0C068` | `--type-ground` |
| flying | `#A890F0` | `--type-flying` |
| psychic | `#F85888` | `--type-psychic` |
| bug | `#A8B820` | `--type-bug` |
| rock | `#B8A038` | `--type-rock` |
| ghost | `#705898` | `--type-ghost` |
| dragon | `#7038F8` | `--type-dragon` |
| dark | `#705848` | `--type-dark` |
| steel | `#B8B8D0` | `--type-steel` |
| fairy | `#EE99AC` | `--type-fairy` |

---

## Typography

### Font Families

- **Headings & Body:** `Inter` (clean, geometric sans-serif)
- **Monospace:** `JetBrains Mono` (for stats, IDs)

### Type Scale (Stripe weight-300 elegance)

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--font-size-xs` | `0.75rem` (12px) | 400 | Badges, captions |
| `--font-size-sm` | `0.875rem` (14px) | 400 | Small text |
| `--font-size-base` | `1rem` (16px) | 400 | Body text |
| `--font-size-lg` | `1.125rem` (18px) | 500 | Emphasized |
| `--font-size-xl` | `1.25rem` (20px) | 500 | Section headings |
| `--font-size-2xl` | `1.5rem` (24px) | 600 | Page headings |
| `--font-size-3xl` | `1.875rem` (30px) | 600 | Hero headings |
| `--font-size-4xl` | `2.25rem` (36px) | 700 | Display text |

### Font Weights (Stripe-style lighter weights)

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-light` | `300` | Display text, large headings |
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Emphasized text |
| `--font-weight-semibold` | `600` | Buttons, labels |
| `--font-weight-bold` | `700` | Strong emphasis |

---

## Component Styling

### Buttons

**Primary:** Solid purple (`--brand-primary`), white text, `font-weight: 500`, subtle shadow on hover

**Secondary:** Ghost style - transparent with border, purple text

**Ghost:** No border, purple text on hover

**Destructive:** Red tint, clear iconography

**States:** Compact, subtle feedback (not overwhelming)

### Cards

- **Borders:** Subtle `1px` borders, not competing for attention
- **Radius:** `8px` (rounded but not playful)
- **Shadow:** Minimal, only on hover (`0 2px 8px rgba(0,0,0,0.04)`)
- **Padding:** `16px` internal, `12px` between cards
- **Hover:** Subtle lift, border color change (not dramatic)

### Form Inputs

- **Border:** `1px solid --gray-200`, subtle
- **Focus:** Purple border, no glow
- **Padding:** `10px 12px` (compact)
- **Font:** `font-weight: 400`
- **Radius:** `6px`

### Navigation (Sidebar)

- **Background:** Slightly darker than page (Linear's recede effect)
- **Width:** `240px` collapsed to `56px`
- **Items:** Icon + label, subtle hover
- **Active state:** Purple accent bar on left, not background fill
- **Dividers:** Very subtle `1px` lines

### Type Badges

- **Style:** Pill/chip, `font-weight: 500`
- **Background:** Type color at 15% opacity
- **Text:** Type color at full saturation
- **Size:** Compact, `padding: 4px 10px`

### Stats Display

- **Style:** Linear's minimal bars
- **Bar height:** `4px` (thin, precise)
- **Bar radius:** `2px`
- **Color:** Gradient from brand-primary to brand-secondary

---

## Layout Principles

### Spacing Scale

4px base unit:
- `4px` (1) - Tight spacing
- `8px` (2) - Icon gaps
- `12px` (3) - Card padding
- `16px` (4) - Section spacing
- `24px` (6) - Page margins
- `32px` (8) - Large sections
- `48px` (12) - Hero spacing

### Grid

- **Catalog grid:** `repeat(auto-fill, minmax(180px, 1fr))` - compact
- **Container max-width:** `1280px`
- **Card gaps:** `16px`

### Whitespace Philosophy

- **"Structure should be felt, not seen"** - Borders clarify relationships, not decoration
- **Generous but efficient** - Not sparse, not cramped
- **Content-first** - UI recedes, Pokémon content leads

---

## Depth & Elevation

### Shadows (Minimal)

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.02)` | Subtle lift |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.04)` | Card hover |
| `--shadow-lg` | `0 4px 16px rgba(0,0,0,0.08)` | Modals |

### Borders (Primary elevation method)

- Cards use borders, not shadows, to differentiate
- Hover state: border color changes subtly
- Active state: border becomes brand-primary

---

## Do's and Don'ts

### Do

- Use `--brand-primary` purple for actionable items only
- Keep borders subtle (`1px`, low contrast)
- Use whitespace to create hierarchy, not heavy dividers
- Design compact, information-dense layouts
- Let the Pokémon artwork/sprites be the visual focus

### Don't

- Use heavy shadows for elevation
- Compete for attention with multiple accent colors
- Use bold fonts everywhere (weight 300-500 is elegant)
- Add decorative elements that don't serve function
- Use large padding that wastes space

---

## Component States

### Button States

| State | Primary | Secondary |
|-------|---------|-----------|
| Default | Purple fill | Transparent |
| Hover | Lighter purple | Purple border |
| Active | Darker purple | Purple fill |
| Disabled | 50% opacity | 50% opacity |

### Card States

| State | Border | Shadow |
|-------|--------|--------|
| Default | `--gray-200` | None |
| Hover | `--gray-300` | `--shadow-md` |
| Active | `--brand-primary` | `--shadow-sm` |

### Input States

| State | Border | Background |
|-------|--------|------------|
| Default | `--gray-200` | White |
| Hover | `--gray-300` | White |
| Focus | `--brand-primary` | White |
| Error | `--color-danger` | `#fef2f2` |

---

## Responsive Behavior

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| xs | 480px | Mobile |
| sm | 640px | Large phone, small tablet |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |

### Touch Targets

- Minimum `44px` for touch
- Buttons `min-height: 36px`

### Collapsing Strategy

- Sidebar collapses to icon-only on mobile
- Grid columns reduce: 4 → 3 → 2 → 1
- Cards maintain aspect ratio, reduce padding

---

## Animation Guidelines

- **Duration:** `150ms` for micro-interactions, `200ms` for transitions
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Linear's smooth ease)
- **Principles:** Subtle, not playful - animations communicate state, not decoration
- **Hover:** Quick feedback (`150ms`)
- **Page transitions:** Smooth but fast (`200ms`)
- **Loading:** Skeleton shimmer, not spinners

---

## Accessibility

- **Contrast:** 4.5:1 minimum for text
- **Focus:** Visible focus rings (`2px solid --brand-primary`)
- **Motion:** `prefers-reduced-motion` respected
- **Keyboard:** Full navigation support
