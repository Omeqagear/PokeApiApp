# Pokémon Brand Color System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the monochromatic orange/yellow palette with a Pokémon-brand-aligned color system featuring coral-red/slate-blue/gold core colors and generation-specific accent colors.

**Architecture:** Core brand colors defined as CSS variables in design tokens. Generation colors stored in a new utility file with a lookup function. Static components use CSS variables directly; generation-aware components inject colors via CSS custom properties.

**Tech Stack:** Angular 21, SCSS, CSS custom properties, Angular Signals

---

### Task 1: Create Generation Colors Utility

**Files:**
- Create: `src/app/shared/utils/generation-colors.ts`

- [ ] **Step 1: Create the generation colors utility file**

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

export const DEFAULT_GENERATION_COLOR = '#E8453C';

export function getGenerationColor(region: string): string {
  const normalized = region.toLowerCase().trim();
  return GENERATION_COLORS[normalized] || DEFAULT_GENERATION_COLOR;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/shared/utils/generation-colors.ts
git commit -m "feat: add generation colors utility"
```

---

### Task 2: Update Color Tokens

**Files:**
- Modify: `src/styles/tokens/_colors.scss`

- [ ] **Step 1: Update brand colors in _colors.scss**

Replace the `$brand-primary`, `$brand-secondary`, `$brand-accent` variables and their light/dark variants:

```scss
// ============================================
// BRAND COLORS - NEO-BRUTALIST POKÉMON
// Coral-red, slate-blue, gold - Pokémon brand identity
// ============================================

$brand-primary: #E8453C;
$brand-primary-light: #F06058;
$brand-primary-dark: #C73A32;

$brand-secondary: #4A6FA5;
$brand-secondary-light: #6A8FC5;
$brand-secondary-dark: #3A5A85;

$brand-accent: #F5C518;
$brand-accent-light: #F8D84E;
$brand-accent-dark: #D4A810;
```

- [ ] **Step 2: Update the comment on line 99**

Change `// Brand (Neo-brutalist orange/yellow)` to `// Brand (Pokémon coral-red/slate-blue/gold)`

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens/_colors.scss
git commit -m "style: update brand colors to Pokémon palette"
```

---

### Task 3: Update Light Theme

**Files:**
- Modify: `src/styles/themes/_light.scss`

- [ ] **Step 1: Update gradients and accents in light theme**

Replace the gradient and shadow sections:

```scss
  // Gradients - Pokémon brand
  --gradient-brand: linear-gradient(135deg, #E8453C 0%, #F5C518 100%);
  --gradient-brand-hover: linear-gradient(135deg, #C73A32 0%, #D4A810 100%);
  --gradient-hero: linear-gradient(135deg, #E8453C 0%, #F06058 50%, #F5C518 100%);
  --gradient-page: linear-gradient(180deg, #FFFEF9 0%, #FFF8F0 100%);

  // Shadows - chunky, neo-brutalist
  --shadow-card: 4px 4px 0px #1A1A1A;
  --shadow-card-hover: 6px 6px 0px #1A1A1A;
  --shadow-elevated: 8px 8px 0px #1A1A1A;
  --shadow-sm: 2px 2px 0px #1A1A1A;
```

- [ ] **Step 2: Update text-link colors**

```scss
  --text-link: #E8453C;
  --text-link-hover: #C73A32;
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/themes/_light.scss
git commit -m "style: update light theme with Pokémon brand gradients"
```

---

### Task 4: Update Dark Theme

**Files:**
- Modify: `src/styles/themes/_dark.scss`

- [ ] **Step 1: Update gradients and accents in dark theme**

```scss
  // Gradients - Pokémon brand neon
  --gradient-brand: linear-gradient(135deg, #E8453C 0%, #F5C518 100%);
  --gradient-brand-hover: linear-gradient(135deg, #F06058 0%, #F8D84E 100%);
  --gradient-hero: linear-gradient(135deg, #2A2218 0%, #3A3020 50%, #E8453C 100%);
  --gradient-page: linear-gradient(180deg, #1A1410 0%, #221C16 100%);

  // Shadows - chunky with dark offset
  --shadow-card: 4px 4px 0px #0A0806;
  --shadow-card-hover: 6px 6px 0px #0A0806;
  --shadow-elevated: 8px 8px 0px #0A0806;
  --shadow-sm: 2px 2px 0px #0A0806;
```

- [ ] **Step 2: Update text-link colors**

```scss
  --text-link: #F06058;
  --text-link-hover: #F5C518;
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/themes/_dark.scss
git commit -m "style: update dark theme with Pokémon brand gradients"
```

---

### Task 5: Update Global Styles

**Files:**
- Modify: `src/styles.scss`

- [ ] **Step 1: Update selection color**

Replace the `::selection` block:

```scss
::selection {
  background: rgba(232, 69, 60, 0.3);
  color: var(--text-primary);
}
```

- [ ] **Step 2: Update Material theme palettes**

Replace the Material palette definitions (lines 36-38):

```scss
$mat-primary: mat.m2-define-palette(mat.$m2-red-palette, 500, 300, 700);
$mat-accent: mat.m2-define-palette(mat.$m2-blue-grey-palette, 400, 200, 600);
$mat-warn: mat.m2-define-palette(mat.$m2-red-palette);
```

- [ ] **Step 3: Commit**

```bash
git add src/styles.scss
git commit -m "style: update global styles with Pokémon brand colors"
```

---

### Task 6: Update Sidebar Styles

**Files:**
- Modify: `src/app/sidebar/sidebar.component.scss`

- [ ] **Step 1: Update active nav item background**

In the `&.active` block, change the background from `var(--brand-primary)` to keep it as-is (it already uses the CSS variable which now points to coral-red).

- [ ] **Step 2: Update nav badge background**

Change the `.nav-badge` background to use gold:

```scss
        .nav-badge {
          margin-left: auto;
          background: var(--brand-accent);
          color: var(--text-inverse);
```

- [ ] **Step 3: Commit**

```bash
git add src/app/sidebar/sidebar.component.scss
git commit -m "style: update sidebar badge to gold accent"
```

---

### Task 7: Update Home Page Styles

**Files:**
- Modify: `src/app/home/home.component.scss`

- [ ] **Step 1: Update hero badge**

Change the `.hero-badge` styles:

```scss
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--surface-card);
      border: 3px solid var(--brand-secondary);
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: 700;
      margin-bottom: 24px;
      letter-spacing: 0.02em;
      box-shadow: 3px 3px 0px var(--border-default);
      text-transform: uppercase;

      .badge-dot {
        width: 8px;
        height: 8px;
        background: var(--brand-primary);
        border-radius: 50%;
        border: 2px solid var(--border-default);
      }
    }
```

- [ ] **Step 2: Update feature card top-bar gradient**

In `.feature-card::before`:

```scss
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--gradient-brand);
      }
```

- [ ] **Step 3: Update feature link button**

In `.feature-link`:

```scss
      .feature-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        font-size: 0.85em;
        color: var(--brand-primary);
        text-decoration: none;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        padding: 8px 16px;
        border: 2px solid var(--brand-primary);
        border-radius: 4px;
        transition: all 150ms;

        &:focus-visible {
          outline: 3px solid var(--brand-primary);
          outline-offset: 2px;
        }

        .arrow {
          transition: transform 150ms;
        }

        &:hover {
          background: var(--brand-primary);
          color: var(--text-inverse);
          transform: translate(-2px, -2px);
          box-shadow: 3px 3px 0px var(--border-default);

          .arrow {
            transform: translateX(4px);
          }
        }
      }
```

- [ ] **Step 4: Commit**

```bash
git add src/app/home/home.component.scss
git commit -m "style: update home page with Pokémon brand colors"
```

---

### Task 8: Update PokeCard Styles

**Files:**
- Modify: `src/app/shared/components/poke-card/poke-card.component.scss`

- [ ] **Step 1: Update card badge to gold**

```scss
.card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--brand-accent);
  color: var(--text-inverse);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.75em;
  font-weight: 800;
  z-index: 2;
  letter-spacing: 0.03em;
  border: 2px solid var(--border-default);
  box-shadow: 2px 2px 0px var(--border-default);
  transition: transform 150ms;
  font-family: 'JetBrains Mono', monospace;
}
```

- [ ] **Step 2: Update hover border color**

In `.poke-card.clickable:hover`:

```scss
    &:hover {
      transform: translate(-3px, -3px);
      box-shadow: 7px 7px 0px var(--border-default);
      border-color: var(--brand-primary);
```

- [ ] **Step 3: Commit**

```bash
git add src/app/shared/components/poke-card/poke-card.component.scss
git commit -m "style: update poke-card badge to gold, hover to coral-red"
```

---

### Task 9: Update StatBar Colors

**Files:**
- Modify: `src/app/shared/components/stat-bar/stat-bar.component.ts`

- [ ] **Step 1: Update barColor computed property**

```typescript
  barColor = computed(() => {
    const v = this.value;
    if (v >= 150) return '#E8453C';
    if (v >= 120) return '#F06058';
    if (v >= 90) return '#F5C518';
    if (v >= 60) return '#78C850';
    return '#4A6FA5';
  });
```

- [ ] **Step 2: Commit**

```bash
git add src/app/shared/components/stat-bar/stat-bar.component.ts
git commit -m "style: update stat-bar colors to Pokémon palette"
```

---

### Task 10: Update PageHeader Gradient

**Files:**
- Modify: `src/app/shared/components/page-header/page-header.component.ts`

- [ ] **Step 1: The gradient already uses `var(--gradient-brand)` which now points to coral-red → gold. No change needed.**

- [ ] **Step 2: Commit (no-op, just confirming)**

```bash
git status
```

---

### Task 11: Update EmptyState Buttons

**Files:**
- Modify: `src/app/shared/components/empty-state/empty-state.component.ts`

- [ ] **Step 1: Update primary button**

```scss
      &.btn-primary {
        background: var(--brand-primary);
        color: var(--text-inverse);
        box-shadow: 4px 4px 0px var(--border-default);

        &:focus-visible {
          outline: 3px solid var(--brand-primary);
          outline-offset: 2px;
        }

        &:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px var(--border-default);
        }
      }
```

- [ ] **Step 2: Update secondary button**

```scss
      &.btn-secondary {
        background: var(--surface-card);
        color: var(--brand-secondary);
        box-shadow: 4px 4px 0px var(--border-default);
        border-color: var(--brand-secondary);

        &:focus-visible {
          outline: 3px solid var(--brand-secondary);
          outline-offset: 2px;
        }

        &:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px var(--border-default);
        }
      }
```

- [ ] **Step 3: Commit**

```bash
git add src/app/shared/components/empty-state/empty-state.component.ts
git commit -m "style: update empty-state buttons to Pokémon brand colors"
```

---

### Task 12: Update PokeballSpinner Color

**Files:**
- Modify: `src/app/shared/components/pokeball-spinner/pokeball-spinner.component.ts`

- [ ] **Step 1: Update spinner top half color**

In the `.pokeball-top` style, change:

```scss
    .pokeball-top {
      position: absolute;
      width: 100%;
      height: 50%;
      border-radius: 50% 50% 0 0;
      background: var(--brand-primary, #E8453C);
      top: 0;
      border: 3px solid var(--border-default, #1A1A1A);
      border-bottom: none;
    }
```

- [ ] **Step 2: Commit**

```bash
git add src/app/shared/components/pokeball-spinner/pokeball-spinner.component.ts
git commit -m "style: update pokeball-spinner to coral-red"
```

---

### Task 13: Update TypeBadge Ghost Variant

**Files:**
- Modify: `src/app/shared/components/type-badge/type-badge.component.ts`

- [ ] **Step 1: Update ghost variant for better contrast**

The current ghost variant uses a generic fallback. Update it to use CSS variables:

```scss
    .variant-ghost {
      background: var(--type-bg-normal, rgba(168, 168, 120, 0.15));
      border: 2px solid rgba(128, 128, 128, 0.3);
      color: var(--text-primary);
      box-shadow: none;
    }
```

- [ ] **Step 2: Commit**

```bash
git add src/app/shared/components/type-badge/type-badge.component.ts
git commit -m "style: fix type-badge ghost variant contrast"
```

---

### Task 14: Add Generation Accent to Regional Pokédex

**Files:**
- Modify: `src/app/regional-pokedex/regional-pokedex.component.ts`
- Modify: `src/app/regional-pokedex/regional-pokedex.component.scss`
- Modify: `src/app/regional-pokedex/regional-pokedex.component.html`

- [ ] **Step 1: Import generation colors utility in component**

Add to imports:

```typescript
import { getGenerationColor } from '../shared/utils/generation-colors';
```

- [ ] **Step 2: Add generation color signal**

Add after the existing signals:

```typescript
  generationAccent = signal<string>('#E8453C');
```

- [ ] **Step 3: Update selectPokedex to set generation color**

```typescript
  selectPokedex(option: PokedexOption): void {
    this.selectedPokedex.set(option);
    this.generationAccent.set(getGenerationColor(option.region));
    this.loadPokedex(option.id);
  }
```

- [ ] **Step 4: Update ngOnInit to set initial generation color**

```typescript
  ngOnInit(): void {
    this.selectedPokedex.set(POKEDEX_OPTIONS[0]);
    this.generationAccent.set(getGenerationColor(POKEDEX_OPTIONS[0].region));
    this.loadPokedex(POKEDEX_OPTIONS[0].id);
```

- [ ] **Step 5: Add CSS variable binding to host**

Add to the `@Component` decorator:

```typescript
  host: {
    '[style.--generation-accent]': 'generationAccent()'
  },
```

- [ ] **Step 6: Update region-badge to use generation color**

In `regional-pokedex.component.scss`, update `.region-badge`:

```scss
  .region-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
    border-radius: 4px;
    font-size: 0.75em;
    font-weight: 600;
    background: color-mix(in srgb, var(--generation-accent) 15%, transparent);
    color: var(--generation-accent);
    text-transform: capitalize;
    border: 2px solid var(--generation-accent);

    mat-icon { font-size: 14px; width: 14px; height: 14px; }
  }
```

- [ ] **Step 7: Update active pokedex chip to use generation color**

```scss
  &.active {
    background: var(--generation-accent);
    color: #fff;
    border-color: var(--generation-accent);
    box-shadow: 3px 3px 0px var(--border-default);
  }
```

- [ ] **Step 8: Update progress bar fill gradient**

```scss
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--generation-accent), var(--brand-accent));
      border-radius: 3px;
      transition: width 300ms ease-out;
    }
```

- [ ] **Step 9: Update viewed indicator dot**

```scss
    &.viewed::after {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--generation-accent);
      box-shadow: 0 0 6px color-mix(in srgb, var(--generation-accent) 50%, transparent);
      z-index: 1;
    }
```

- [ ] **Step 10: Commit**

```bash
git add src/app/regional-pokedex/regional-pokedex.component.*
git commit -m "feat: add generation accent colors to regional pokedex"
```

---

### Task 15: Build Verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Build succeeds. Pre-existing bundle budget warnings are acceptable. No new CSS or TypeScript errors.

- [ ] **Step 2: Verify color changes visually**

- Primary buttons should be coral-red (`#E8453C`)
- Secondary buttons should have slate-blue (`#4A6FA5`) borders/text
- Badges should be gold (`#F5C518`)
- Regional Pokédex chips should change color when switching regions
- Sidebar active state should be coral-red

- [ ] **Step 3: Commit any final fixes**

```bash
git add -A
git commit -m "fix: address build verification findings"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Core brand palette (coral-red, slate-blue, gold) - Tasks 2-5
- ✅ Generation accent colors - Task 1, Task 14
- ✅ Sidebar updates - Task 6
- ✅ Home page updates - Task 7
- ✅ PokeCard updates - Task 8
- ✅ StatBar updates - Task 9
- ✅ PageHeader (uses CSS variable, no change needed) - Task 10
- ✅ EmptyState updates - Task 11
- ✅ PokeballSpinner updates - Task 12
- ✅ TypeBadge ghost variant - Task 13
- ✅ Regional Pokédex generation accents - Task 14
- ✅ Build verification - Task 15

**Placeholder scan:** No TBD, TODO, or vague requirements found.

**Type consistency:** All color values use hex codes consistently. CSS variable names match between token definitions and component usage.

**Scope check:** Focused on color system changes only. No unrelated refactoring.
