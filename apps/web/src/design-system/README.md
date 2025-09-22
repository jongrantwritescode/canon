# Canon Design Tokens

This folder defines the design language that Standards UI consumes when it renders the Canon web experience. The token map in [`tokens.ts`](./tokens.ts) is passed to `StandardsUI.init` so the design system injects consistent CSS custom properties before any components render. The sections below summarize the semantics behind the tokens so component authors can reuse them confidently.

## Color palette

| Token | Purpose |
| --- | --- |
| `color.primary` | Canon's accent blue, used for primary buttons, links, and focused interactive elements. |
| `color.primaryHover` / `color.primaryActive` | Darker blue shades that the design system applies on hover and pressed states for primary buttons. |
| `color.secondary` | Muted charcoal used for secondary text or subdued accents. |
| `color.tertiary` | Neutral border tone for dividers and outlines. |
| `color.text` | Main body text color. |
| `color.textMuted` | Subheadings, helper text, and metadata. |
| `color.background` | App background color behind page surfaces. |
| `color.surface` | Default card and article surface color. |
| `color.surfaceMuted` | Subtle backgrounds such as the sidebar and statistic tiles. |
| `color.surfaceRaised` / `color.highlight` | Elevated backgrounds used to indicate active selections. |
| `color.border` / `color.borderStrong` | Standard and emphasis border colors for cards, panels, and separators. |
| `color.overlay` | Backdrop color for overlays and modals. |
| `color.success`, `color.warning`, `color.danger`, `color.info` | Status indicators for queue metrics, toast messages, and destructive actions. |

## Typography tokens

- `typography.fontFamily`: Canon's sans-serif system stack used across body copy.
- `typography.headingFontFamily`: Serif accent face for hero and article headings.
- `typography.fontSize` & `typography.lineHeight`: Baseline rhythm for paragraphs.
- `typography.headingWeight` / `headingLineHeight`: Provide consistent hierarchy for headings rendered by Standards UI components.

## Spacing scale

Spacing tokens create a shared rhythm for layout primitives:

- `spacing.xs` / `spacing.sm` / `spacing.md`: Compact spacing for inline elements, list items, and form controls.
- `spacing.mdPlus`: 12px step used for gutters inside cards and modal controls.
- `spacing.lg`, `spacing.xl`, `spacing.xxl`, `spacing.xxxl`: Larger steps for card padding, section breaks, and hero blocks.
- `spacing.pagePadding`: Horizontal padding applied at the page level.
- `spacing.contentGap`: Default gap between major layout regions.
- `spacing.cardPadding`: Internal padding for cards, tiles, and article sections.
- `spacing.sidebarPadding`: Narrow padding used inside the navigation sidebar.
- `spacing.heroVertical` / `spacing.heroHorizontal`: Padding scale for homepage hero content.
- `spacing.modalPadding`: Interior spacing for modal content areas.

## Layout primitives

- `layout.pageMaxWidth`: Keeps long-form content readable on wide displays.
- `layout.sidebarWidth`: Fixed width for navigation stacks.
- `layout.contentGap`: Shared gap between the sidebar and main content.
- `layout.cardGridMin`: Minimum tile width for responsive grids.

## Shape tokens

- `shape.radiusSm`, `shape.radiusMd`, `shape.radiusLg`: Corner radii used by cards, modals, and buttons to maintain consistent curvature.
- `shape.borderWidth`: Default border thickness across surfaces.

## Component-specific overrides

The `components.button` block maps the canonical color palette to Standards UI button variants:

- **Primary** – Solid blue call-to-action used for the main path in flows.
- **Secondary** – Transparent outline button for secondary actions and navigation controls.
- **Danger** – Red destructive button for irreversible actions (e.g., queue cancellation).

Each variant includes hover, focus, active, and disabled state overrides so interactive feedback stays on brand.

When adding new components, prefer reusing these tokens instead of hard-coding colors or spacing. If a new semantic slot is required (for example, a "tertiary" surface for charts), extend `tokens.ts` so the semantics remain centralized.
