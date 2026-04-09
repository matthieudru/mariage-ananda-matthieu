# Project Guidelines

## Code Style
See [UI_RULES.md](UI_RULES.md) for complete design system, colors, spacing scale, typography, and animation principles. Use Georgia serif font, clamp() for responsive text. Spacing limited to: 4/8/12/16/24/32/48/64/96px. Colors: #f3ecdc (bg), #243b71 (primary/text), no others.

## Architecture
Wedding website with hero animation, programme infos, RSVP form with Canvas mini-game, and Google Sheets integration. Client components for interactivity, static data in components.

## Workflow
After every code change: commit and push to main automatically, without asking.

## Build and Test
- `npm run dev` - Development on localhost:3000
- `npm run iphone` - Hardware testing on 0.0.0.0:3002
- `npm run build` - Production build
- `npm run lint` - ESLint with Next.js rules

## Conventions
Animations use ease-out/linear with cubic-bezier, durations 150-600ms, no bounce/spring. Hover states: background image reveal + text color toggle. Touch handling: onTouchStart with 200-400ms delays. Borders preferred over shadows. Canvas games with image fallbacks. See [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) for RSVP integration.
