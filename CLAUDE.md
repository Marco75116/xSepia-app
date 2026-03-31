@AGENTS.md

# xStocks

Web3 batch-buying app built on top of [xStocks](https://xstocks.fi/) RWA stock tokens. Users deposit funds and schedule batch buys executed on Uniswap pools via ERC-4337 smart accounts.

Documentation: https://docs.xstocks.fi/docs

## Branding

- **Brand name**: xStocks

## Design Philosophy

PROFESSIONAL. CLEAN. MODERN.

- Light mode only
- Focus on data clarity and usability
- Modern card-based UI
- Performance-first approach

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript 5
- **UI**: shadcn/ui (base-nova style, neutral base color) + Radix UI + Tailwind CSS 4
- **Linter/Formatter**: Biome
- **Git hooks**: Husky + lint-staged
- **Web3 (frontend)**: Wagmi (wagmi.sh) for React hooks + wallet connection
- **Web3 (backend)**: Viem for chain interactions, contract calls, encoding
- **Smart Accounts**: ERC-4337, Uniswap pool interactions
- **Backend**: ElysiaJS (embedded in Next.js API routes) + Eden Treaty (type-safe client)
- **Deployment**: Vercel

## Package Manager

Use **Bun** only. Never use npm or yarn.

```bash
bun run dev        # Start dev server
bun run build      # next build
bun run lint       # Biome check
bun run lint:fix   # Biome check --write
bun run format     # Biome format --write
```

## Branch & Commit Convention

- Branch format: `type/brief-description` (e.g. `feat/add-login-page`, `fix/header-overflow`)
- Commit format: `type: brief description`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## Import Paths

Always use `@/` alias. Never use relative paths like `../../`.

## File Organization

```
src/
├── app/                            # Next.js App Router pages
│   ├── api/
│   │   └── [[...slugs]]/
│   │       └── route.ts            # Elysia catch-all adapter
│   ├── page.tsx                    # Landing page
│   └── layout.tsx                  # Root layout
├── server/
│   ├── app.ts                      # Root Elysia instance + App type export
│   └── routes/                     # Elysia route modules (one per domain)
│       └── health.ts               # Health check route
├── components/
│   └── ui/                         # shadcn/ui base components
└── lib/
    ├── eden.ts                     # Eden Treaty client singleton
    └── utils.ts                    # Utility functions (cn)
```

## File Naming

- Components: PascalCase (`Button.tsx`)
- Utilities: camelCase (`formatters.ts`)
- Types: PascalCase (`Pool.ts`)
- UI components (shadcn): kebab-case (`dropdown-menu.tsx`)

## UI Components

Use shadcn/ui for **every** component — never build raw HTML elements when a shadcn/ui primitive exists. Add new ones with `bunx shadcn@latest add <component>`.

- Always wrap content in shadcn/ui components instead of plain HTML elements with manual Tailwind styling
- Use CVA (class-variance-authority) for variants
- Use `cn()` from `@/lib/utils` for class merging
- Server Components by default, `"use client"` only when needed

## Styling

- Tailwind utility classes only (no inline styles, no new CSS files)
- Use CSS variables from `globals.css` for colors
- Light mode only

## Code Quality

- No `any` type — use `unknown` or proper types
- No `console.log` in production code
- Prefer `const` over `let`
- No comments — code should be self-explanatory
- Factorize into smaller components/functions
- Prefer explicit props typing over `React.FC`

## Dependencies

Ask before installing new dependencies.
