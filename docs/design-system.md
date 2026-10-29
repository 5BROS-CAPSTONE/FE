# SmartDroneHub interface system

The visual direction pairs agricultural landscape photography with an editorial type scale and a quieter workspace interface. The customer website, Staff workspace and Admin workspace retain their own entry routes and sessions.

## Foundations

- `src/styles/tokens.css`: locally hosted typefaces, colors, spacing, type scale, radii, focus treatment and motion preferences.
- `src/styles/site.css`: website, authentication and workspace compositions with explicit responsive breakpoints.
- `src/styles/components.css`: reusable controls, tables, menus, dialogs, field states and measured form action bars.
- Be Vietnam Pro supplies interface text at 400/500/600/700. Lora supplies actual italic Vietnamese headings, replacing OS serif fallbacks.
- Reading text is generally 15–16px; workspace metadata is 11–13px. Display and section headings use fluid sizes.
- Main website content is capped at 1320px, framed sections at 1600px, and internal workspace content at 1536px. Gutters scale from 16px to 64px.
- Controls use 44px minimum touch targets; inputs are at least 16px on small screens to avoid iOS focus zoom. Layouts use `minmax(0, 1fr)` / `min-width: 0`, with horizontal scrolling confined to data tables when needed.

## Interaction behavior

- Buttons have default, hover, pressed, keyboard focus and disabled treatment; loading/error feedback remains connected to existing form logic.
- Field errors are announced and connected to native controls. Request types are labeled radio choices so full Vietnamese names remain readable on phones; the three Field actions remain a dropdown.
- Dialogs use the browser's top layer, lock background scrolling, wrap keyboard focus, support Escape/backdrop dismissal and restore focus to the invoking control.
- Row action menus render outside table clipping containers, stay anchored during horizontal scrolling, and support arrows, Home/End, Tab and Escape.
- Mobile workspace navigation uses a focus loop, background inertness and explicit closed visibility.
- Fixed action bars are measured with ResizeObserver. Form bottom spacing follows their actual height, including wrapping and safe-area padding.
- Page fades avoid transforming ancestors of fixed controls. GSAP animation contexts are scoped and reverted; reduced-motion mode skips nonessential animation.

## Verification

The responsive audit uses Playwright viewport simulation in Chromium/Chrome, Firefox and WebKit. It checks public/authentication pages at 320, 390, 768, 1024, 1440 and 1920px, and 33 authenticated route variants at 320, 768 and 1440px. The 369-case matrix checks document width, visible control bounds and JavaScript errors, with external font hosts blocked for public pages.

Interaction checks cover keyboard menus, dialog focus/close/restore, mobile navigation, bounds of mobile menus/dialogs and request submission. Existing `npm run check` and `npm run build` remain the project gates. API contracts, role rules, business stores and ticket state transitions retain their existing responsibilities.
