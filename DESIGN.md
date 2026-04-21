# DESIGN.md — Tempus Sales Copilot

## Visual theme and atmosphere

Tempus's brand is **clinical precision meets technological authority**. The website alternates between clean white sections and deep near-black sections. Typography is the hero — ultra-light weight display text at massive scale, with tight letter-spacing. The accent is a confident royal blue used sparingly on primary CTAs. The overall aesthetic is closer to a luxury medical device company than a SaaS dashboard: restrained, spacious, and letting content breathe. Feature cards on dark backgrounds use a glassmorphic treatment with subtle border glows. Navigation is uppercase, tracked-out, and minimal.

The Tempus homepage hero reads "AI-enabled precision medicine" in weight-300 sans-serif at ~60px on a white background with a translucent glass sphere. The technology page switches to near-black with cards labeled ONE, NEXT, LENS, ALGOS — each a dark slate card with subtle borders, the active one glowing blue. This dark/light rhythm defines the entire brand.

## Color palette and roles

| Role                      | Token                | Value                      |
|---------------------------|----------------------|----------------------------|
| Background light          | --bg-primary         | #FFFFFF                    |
| Background dark           | --bg-dark            | #0D0D0D                    |
| Surface dark (cards)      | --bg-surface-dark    | #1A1D23                    |
| Surface light             | --bg-surface-light   | #F5F5F7                    |
| Brand accent              | --accent-primary     | #3B5BDB                    |
| Accent hover              | --accent-hover       | #2B4BC8                    |
| Accent glow               | --accent-glow        | rgba(59, 91, 219, 0.15)   |
| Success                   | --color-success      | #2E8B57                    |
| Warning                   | --color-warning      | #D4870E                    |
| Danger                    | --color-danger       | #D32F2F                    |
| Text primary (light bg)   | --text-primary       | #1A1A1A                    |
| Text primary (dark bg)    | --text-on-dark       | #FFFFFF                    |
| Text secondary            | --text-secondary     | #6B7280                    |
| Text muted                | --text-muted         | #9CA3AF                    |
| Text muted (dark bg)      | --text-muted-dark    | rgba(255, 255, 255, 0.6)  |
| Border light              | --border-default     | #E5E7EB                    |
| Border dark               | --border-dark        | rgba(255, 255, 255, 0.08) |
| Border glow (active/hover)| --border-glow        | rgba(59, 91, 219, 0.3)    |

## Typography rules

Display font: **"Instrument Sans"** (Google Fonts) or fallback **"Helvetica Neue", -apple-system, system-ui**
Mono font: **"JetBrains Mono"** — for scores, metrics, gene names, test identifiers (xT CDx, xR, etc.)

The signature Tempus look is ultra-light weight (300) display text at large sizes with tight negative letter-spacing. Body text is regular weight. Navigation is uppercase, tracked out, medium weight.

| Level       | Size  | Weight | Line-height | Letter-spacing | Usage                              |
|-------------|-------|--------|-------------|----------------|------------------------------------|
| Display     | 48px  | 300    | 1.1         | -1.5px         | Page hero headings                 |
| Heading 1   | 32px  | 400    | 1.2         | -1.0px         | Section headers                    |
| Heading 2   | 20px  | 500    | 1.3         | -0.3px         | Card titles, panel headers         |
| Nav label   | 13px  | 600    | 1.0         | 1.5px          | Sidebar nav items, uppercase       |
| Tag label   | 11px  | 600    | 1.0         | 1.0px          | Category badges, uppercase (ONE, NEXT) |
| Body        | 14px  | 400    | 1.6         | -0.1px         | Default reading text               |
| Caption     | 12px  | 400    | 1.4         | 0              | Labels, metadata, timestamps       |
| Metric      | 28px  | 600    | 1.0         | -0.5px         | Mono — scores, numbers, percentages |

## Component styles

### Button (primary — "CONTACT US" style)
- Background: var(--accent-primary)
- Color: white
- Padding: 10px 20px
- Border-radius: 4px (squared, NOT rounded/pill)
- Font: 13px, weight 600, uppercase, letter-spacing 0.5px
- Hover: var(--accent-hover)
- Focus: 2px ring var(--accent-primary) offset 2px
- Disabled: opacity 0.5, pointer-events none

### Button (outline — "ORDER A TEST" / "LOG IN" style)
- Background: transparent
- Border: 1px solid var(--text-primary) (or var(--text-on-dark) on dark backgrounds)
- Color: var(--text-primary) (or var(--text-on-dark))
- Padding: 10px 20px
- Border-radius: 4px
- Font: 13px, weight 600, uppercase, letter-spacing 0.5px
- Hover: background rgba(0,0,0,0.05) on light, rgba(255,255,255,0.05) on dark

### Score Badge
- Circular, 48x48px
- Background: var(--accent-primary)
- Font: Metric level, white, mono
- Border-radius: 50%

### Provider Card (light mode — dashboard)
- Background: white
- Border: 1px solid var(--border-default)
- Border-radius: 12px
- Padding: 20px 24px
- Hover: border-color transitions to var(--accent-glow), subtle shadow level 2
- High-priority indicator: small blue dot (8px), not a left accent bar

### Provider Card (dark mode — feature/coaching sections)
- Background: var(--bg-surface-dark)
- Border: 1px solid var(--border-dark)
- Border-radius: 12px
- Padding: 20px 24px
- Hover: border transitions to var(--border-glow), box-shadow 0 0 20px var(--accent-glow)
- Active: border var(--accent-primary) at 50% opacity
- Glassmorphic: backdrop-filter: blur(12px) if overlapping imagery

### Objection Card (coaching response)
- Background: var(--bg-surface-light) on light bg, var(--bg-surface-dark) on dark bg
- Border-left: 3px solid var(--accent-primary)
- Border-radius: 8px
- Padding: 16px 20px
- Animated entrance: slide-in from right, 200ms ease-out
- On dark bg: subtle blue glow on left border

### Listen Button (coaching mode)
- Circular, 64x64px
- Idle: var(--bg-surface-light) background, var(--text-secondary) mic icon
- Listening: var(--accent-primary) background, white mic icon
- Listening animation: pulsing ring — box-shadow 0 0 0 Npx var(--accent-glow), N scales 0→20px on 1.5s infinite
- Transition: background 200ms ease

### Sidebar Navigation
- Background: var(--bg-dark)
- Width: 240px fixed
- Nav items: uppercase, 13px, weight 600, letter-spacing 1.5px, color var(--text-muted-dark)
- Active nav item: color var(--text-on-dark), left border 2px solid var(--accent-primary)
- Hover: color var(--text-on-dark)
- Logo: top of sidebar, white Tempus wordmark

### Input / Search
- Background: white (light) or var(--bg-surface-dark) (dark)
- Border: 1px solid var(--border-default) (light) or var(--border-dark) (dark)
- Border-radius: 8px
- Padding: 10px 14px
- Font: 14px, weight 400
- Focus: border-color var(--accent-primary), box-shadow 0 0 0 3px var(--accent-glow)

## Layout principles

- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 48, 64, 96
- Max content width: 1200px
- Sidebar width: 240px fixed
- Card gap: 16px
- Section gap: 48-80px
- Border-radius scale: 4px (button), 8px (input/objection card), 12px (card/panel), 16px (modal/overlay)

## Depth and elevation

| Level   | Usage                | Shadow                                     |
|---------|---------------------|---------------------------------------------|
| Level 0 | Page bg             | none                                        |
| Level 1 | Card on light bg    | 0 1px 3px rgba(0,0,0,0.04)                 |
| Level 2 | Dropdown, hover     | 0 4px 16px rgba(0,0,0,0.08)                |
| Level 3 | Modal, overlay      | 0 12px 32px rgba(0,0,0,0.12)               |
| Glow    | Active card on dark  | 0 0 20px rgba(59,91,219,0.15)              |

On dark backgrounds, depth comes from border glow (blue), not shadow. Shadow system is for light backgrounds only.

## Do's and don'ts

**Do:**
- Alternate between white and near-black sections (dashboard = light, coaching overlay = dark)
- Keep display text ultra-light weight (300) at large sizes — this IS the Tempus signature
- Use uppercase + letter-spacing for nav items, category labels, and tags
- Use blue accent sparingly — CTAs, active states, score badges, glow borders only
- Use monospace for test identifiers (xT CDx, xR, xF+), gene names, and numeric metrics
- Show score breakdowns on hover/click — transparency builds rep trust
- Let typography and spacing do the work — minimal decoration

**Don't:**
- Don't use warm accent colors (coral, orange, amber, red) — Tempus is cool-toned: blue + gray + black + white
- Don't use heavy font weights for display headings — weight 300-400, never 600+ for hero text
- Don't use rounded pill buttons — Tempus buttons are squared (4px radius)
- Don't use colored section backgrounds — only white (#FFFFFF) and near-black (#0D0D0D)
- Don't use decorative elements, gradients, or patterns — the brand is defined by restraint
- Don't use shadows on dark backgrounds — use border glow instead
- Don't animate anything that isn't a coaching response, state transition, or hover glow
- Don't mix more than 2 font weights on a single view

## Responsive behavior

| Breakpoint | Width     | Behavior                                  |
|------------|-----------|-------------------------------------------|
| Mobile     | < 640px   | Single column, sidebar collapses to hamburger menu |
| Tablet     | < 1024px  | Sidebar becomes slide-out overlay         |
| Desktop    | >= 1024px | Full layout with persistent sidebar       |

- Touch target minimum: 44x44px
- Font sizes don't drop below 13px on mobile
- Listen button scales to 56px on mobile (from 64px)
- Score badges scale to 40px on mobile (from 48px)

## Agent prompt guide

Quick palette: bg-light=#FFF, bg-dark=#0D0D0D, surface-dark=#1A1D23, accent=#3B5BDB, text=#1A1A1A, text-on-dark=#FFF

### Ready-to-use prompts:
- "Create the dashboard view" → white bg, white cards with 1px #E5E7EB border and 12px radius, blue score badges, dark sidebar (#0D0D0D) with uppercase tracked nav, display heading "Your Territory" at weight 300 size 48px
- "Build the provider detail view" → white bg, physician dropdown with 8px radius input, CRM notes in timeline format, generated content cards with blue left border
- "Build the coaching overlay" → dark bg (#0D0D0D), full-screen overlay, glassmorphic physician context card (#1A1D23 with blue glow border), listen button with pulse animation, response cards slide in from right with blue left accent
- "Build a data table" → compact rows (40px height), monospaced test names and metrics, 1px #E5E7EB row borders, header row at #F5F5F7, hover highlight at rgba(59,91,219,0.04)
