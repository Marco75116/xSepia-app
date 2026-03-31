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
- **UI**: shadcn/ui (default style, neutral base color, oklch colors) + Radix UI + Tailwind CSS 4
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
│   ├── (app)/                      # Route group with sidebar layout
│   │   ├── layout.tsx              # SidebarProvider + AppSidebar + SidebarInset
│   │   └── page.tsx                # Home page
│   └── layout.tsx                  # Root layout
├── server/
│   ├── app.ts                      # Root Elysia instance + App type export
│   └── routes/                     # Elysia route modules (one per domain)
│       └── health.ts               # Health check route
├── components/
│   ├── AppSidebar.tsx              # Sidebar navigation (collapsible)
│   ├── Navbar.tsx                  # Top bar with SidebarTrigger + breadcrumbs
│   ├── ContentLayout.tsx           # Wraps page content with Navbar
│   └── ui/                         # shadcn/ui base components
└── lib/
    ├── menu-list.ts                # Sidebar navigation config
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

## Smart Contracts — Ink Mainnet (Chain ID: 57073)

### Deployed Addresses

| Contract | Address |
|----------|---------|
| AccountFactory | `0x52ce41F6B4e95b6891F93Ad85165b525412e1362` |
| Operator (backend signer) | `0xB351edfb846d7c26Aed130c2DE66151c1efF5236` |
| USDC | `0x2D270e6886d130D724215A266106e6832161EAEd` |
| CoW Relayer | `0xC92E8bdf79f0507f65a392b0ab4667716BFE0110` |

### AccountFactory

Deploys one `UserAccount` per user via CREATE2 (deterministic addresses).

| Function | Description |
|----------|-------------|
| `createAccount(address owner) → address` | Deploys a new UserAccount for the given owner. Reverts if one already exists. |
| `predictAddress(address owner) → address` | Returns the deterministic address where the user's account will be deployed (can be called before deployment to get a deposit address). |
| `hasAccount(address owner) → bool` | Returns true if the owner already has an account. |
| `accountOf(address) → address` | Returns the deployed UserAccount address (or 0x0). |

### UserAccount

ERC-1271 smart account that validates operator/owner signatures for CoW Protocol settlement. Auto-approves the CoW Relayer for USDC at deployment.

| Function | Access | Description |
|----------|--------|-------------|
| `isValidSignature(bytes32 hash, bytes sig) → bytes4` | Anyone | ERC-1271: returns `0x1626ba7e` if signed by operator or owner, `0xffffffff` otherwise. Used by CoW Protocol to verify swap orders. |
| `withdraw(address token, uint256 amount)` | Owner only | Withdraws any ERC-20 token back to the owner. |
| `withdrawEth(uint256 amount)` | Owner only | Withdraws ETH from the account. |
| `setOperator(address newOperator)` | Owner only | Rotates the operator key. |
| `approveSpender(address token, address spender, uint256 amount)` | Owner only | Approves an additional token spender. |
| `receive()` | Anyone | Accepts incoming ETH. |

### Flow

1. Backend calls `predictAddress(userEOA)` to get the user's deposit address before account creation.
2. User deposits USDC to that address.
3. Backend calls `createAccount(userEOA)` — deploys the UserAccount (USDC approval to CoW Relayer is set automatically).
4. Backend operator signs CoW swap orders; CoW Protocol verifies via `isValidSignature`.
5. User can withdraw their tokens at any time (full self-custody).

## Dependencies

Ask before installing new dependencies.
