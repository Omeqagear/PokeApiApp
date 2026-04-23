# Design Spec: Pokémon Brand Color System

**Date:** 2026-04-23
**Status:** Approved
**Author:** opencode

## Overview

Replace the current monochromatic orange/yellow neo-brutalist palette with a Pokémon-brand-aligned color system featuring a unified coral-red/slate-blue/gold core palette, plus generation-specific accent colors applied contextually.

## Problem

The current orange/yellow palette is too monochromatic and doesn't evoke the Pokémon brand identity. Buttons lack sufficient contrast differentiation. The app needs a color system that feels authentically Pokémon while maintaining the neo-brutalist aesthetic.

## Color System

### Core Brand Palette (Global)

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-primary` | `#E8453C` | Primary CTAs, active states, important buttons |
| `--brand-secondary` | `#4A6FA5` | Secondary actions, links, info elements |
| `--brand-accent` | `#F5C518` | Badges, highlights, star ratings, special markers |
| `--brand-primary-dark` | `#C73A32` | Primary hover/active states |
| `--brand-secondary-dark` | `#3A5A85` | Secondary hover/active states |

### Generation Accent Colors (Contextual)

| Region | Color | Hex |
|--------|-------|-----|
| Kanto | Classic Red | `#DC0A2D` |
| Johto | Gold/Bronze | `#C8A030` |
| Hoenn | Teal/Aqua | `#00A0B0` |
| Sinnoh | Platinum/Silver | `#686878` |
| Unova | Deep Charcoal | `#2C2C2C` |
| Kalos | Royal Purple | `#5B3A8C` |
| Alola | Tropical Coral | `#FF6B6B` |
| Galar | Violet | `#8B5CF6` |
| Paldea | Teal | `#14B8A6` |

**Usage Pattern:** Generation colors appear as top-border accents on cards, section dividers, and subtle background tints when browsing generation-specific content. They never override the primary/secondary buttons.

## Component Updates

### Global Styles
- Update CSS variables in `_colors.scss` and theme files
- Gradients: coral-red → gold
- Selection color: coral-red with opacity
- Links and focus states: coral-red

### Sidebar
- Active nav item: coral-red background, white text
- Nav badge: gold background, dark text
- Logo icon: coral-red
- Theme toggle border: slate-blue on hover

### Home Page
- Hero badge: slate-blue border, coral-red dot
- "Pokédex" highlight: coral-red → gold gradient
- Primary button: coral-red background
- Secondary button: white background, slate-blue border/text
- Feature card top-bar: coral-red → gold gradient
- Feature link: coral-red border/text, hover fills coral-red
- Stat numbers: coral-red → gold gradient

### PokeCard
- Badge: gold background, dark text
- Hover border: coral-red
- Type pills: unchanged (existing type colors have good contrast)

### Shared Components
- **TypeBadge:** Solid/outline variants use actual type colors (no change)
- **StatBar:** Bar colors: coral-red (high), gold (mid), slate-blue (low)
- **PageHeader:** Title gradient: coral-red → gold
- **EmptyState:** Primary button coral-red, secondary slate-blue
- **PokeballSpinner:** Top half coral-red

### Generation-Aware Components
- **Regional Pokédex:** Cards get 4px top border in region's color
- **Evolution Chains:** Chain connectors use generation color
- **Move/Ability Detail:** Type headers get subtle generation-tinted backgrounds

## Architecture

### New File: `src/app/shared/utils/generation-colors.ts`

```typescript
export const GENERATION_COLORS: Record<string, string> = {
  kanto: '#DC0A2D',
  johto: '#C8A030',
  hoenn: '#00A0B0',
  sinnoh: '#686878',
  unova: '#2C2C2C',
  kalos: '#5B3A8C',
  alola: '#FF6B6B',
  galar: '#8B5CF6',
  paldea: '#14B8A6',
};

export function getGenerationColor(region: string): string {
  return GENERATION_COLORS[region.toLowerCase()] || '#E8453C';
}
```

### CSS Variable Flow

1. **Static components** use CSS variables (`--brand-primary`, etc.) - no JS needed
2. **Dynamic generation-aware components** inject generation color via:
   - Component reads current route/region from router or input
   - Calls `getGenerationColor()` to get hex value
   - Applies as inline style or CSS custom property on container
   - Child components inherit via CSS variables

### Error Handling
- Unknown region → falls back to coral-red primary
- Missing CSS variable → falls back to brand primary
- No runtime errors, graceful degradation

## Files to Modify

1. `src/styles/tokens/_colors.scss` - Update brand colors
2. `src/styles/themes/_light.scss` - Update gradients and accents
3. `src/styles/themes/_dark.scss` - Update gradients and accents
4. `src/styles.scss` - Update selection color, Material theme palette
5. `src/app/sidebar/sidebar.component.scss` - Active state, badge colors
6. `src/app/home/home.component.scss` - All color references
7. `src/app/shared/components/poke-card/poke-card.component.scss` - Badge, hover colors
8. `src/app/shared/components/stat-bar/stat-bar.component.ts` - Bar colors
9. `src/app/shared/components/page-header/page-header.component.ts` - Title gradient
10. `src/app/shared/components/empty-state/empty-state.component.ts` - Button colors
11. `src/app/shared/components/pokeball-spinner/pokeball-spinner.component.ts` - Spinner color
12. `src/app/shared/components/type-badge/type-badge.component.ts` - Ghost variant fix
13. `src/app/regional-pokedex/regional-pokedex.component.*` - Generation accent integration
14. `src/app/evolution-chains/evolution-chains.component.*` - Generation accent integration
15. **New:** `src/app/shared/utils/generation-colors.ts`

## Testing

- Unit test for `getGenerationColor()` covering all 9 regions + fallback
- Build verification (no CSS errors)
- Visual check: buttons have clear contrast differentiation
- Visual check: generation accents appear correctly in regional pokedex

## Success Criteria

1. Primary buttons are clearly distinguishable from secondary buttons
2. The app feels authentically Pokémon (red/blue/yellow brand identity)
3. Generation-specific pages have subtle but noticeable accent colors
4. All existing neo-brutalist styling (borders, shadows) is preserved
5. Build passes without errors
