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

## Icons

Use **lucide-react** only for all icons. Never use emoji characters — always use the equivalent Lucide icon instead.

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

## xStocks Public API

Base URL: `https://api.xstocks.fi/api/v2`

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /public/assets` | None | Returns all assets with deployments per network |
| `GET /public/assets/{symbol}` | None | Returns a single asset by symbol |

### xStocks ERC20 Tokens on Ink (100 tokens)

Fetched from `GET /public/assets` filtering `deployments[].network == "Ink"`.

| Symbol | Address | Name |
|--------|---------|------|
| ABTx | `0x89233399708c18ac6887f90a2b4cd8ba5fedd06e` | Abbott |
| ACNx | `0x03183ce31b1656b72a55fa6056e287f50c35bbeb` | Accenture |
| ADBEx | `0x16e0b579be45baae54ceddd52e742b6457a7fe12` | Adobe |
| AMATx | `0xe9fa01197b7e836982a1cab03fe591f7e331e313` | Applied Materials |
| AMBRx | `0x2f9a35ab5ddfbc49927bfdeab98a86c53dc6e763` | Amber |
| AMDx | `0x3522513e5f146a2006e2901b05f16b2821485e19` | AMD |
| ANETx | `0x27ad5cc5242f4258030d81a5639098ce0a96820f` | Arista Networks |
| APLDx | `0x9f7371f5b85443ee59457468ede9d244a71c08d6` | Applied Digital |
| APPx | `0x50a1291f69d9d3853def8209cfb1af0b46927be1` | AppLovin |
| ASMLx | `0xc0b417e7f83db438631eb5e096684dd742e5294f` | ASML |
| ASTSx | `0x89b2607878ae19bab8020b8140ed550ef3e953bb` | AST SpaceMobile |
| BACx | `0x314938c596f5ce31c3f75307d2979338c346d7f2` | Bank of America |
| BMNRx | `0xaeb681b69e5094e04d11bcef51a71358a374c3ed` | Bitmine |
| BTBTx | `0x22e1991e5f82736a2a990322a46aac0e95826c5b` | Bit Digital |
| BTGOx | `0x60ae7d760a1c7b528c0384bc945fadf1438f47a5` | Bitgo |
| CEGx | `0x7636244bab612264e1b2dfd4ba6e26d0311b1eb7` | Constellation Energy |
| CLSKx | `0xd0194f0f077968da8ca59811e9407f54ae6c9432` | CleanSpark |
| CMCSAx | `0xbc7170a1280be28513b4e940c681537eb25e39f4` | Comcast |
| COINx | `0x364f210f430ec2448fc68a49203040f6124096f0` | Coinbase |
| COPXx | `0x89bab39d627a9e34f0dc782c53457e80ee8fb9d9` | Global X Copper Miners |
| CORZx | `0x51ed5b74a05f256dbd9ebb4e4f68bb41ba10160b` | Core Scientific |
| CRCLx | `0xfebded1b0986a8ee107f5ab1a1c5a813491deceb` | Circle |
| CRWDx | `0x214151022c2a5e380ab80cdac31f23ae554a7345` | CrowdStrike |
| DELLx | `0x2782df1cc877f720c81b4f6568db64563f1d3aa3` | Dell Technologies |
| DFDVx | `0x521860bb5df5468358875266b89bfe90d990c6e7` | DFDV |
| DHRx | `0xdba228936f4079daf9aa906fd48a87f2300405f4` | Danaher |
| ETNx | `0xbca703c64f616a17b4f2763f34f93400dbe20f17` | Eaton |
| GEVx | `0x5fb4184f8b515b1c54d1bac839dcf81276d6b73e` | GE Vernova |
| GLDx | `0x2380f2673c640fb67e2d6b55b44c62f0e0e69da9` | Gold |
| GLXYx | `0xf7f4fac56f012de7dd6adff54c761986b9e0655a` | Galaxy Digital |
| GMEx | `0xe5f6d3b2405abdfe6f660e63202b25d23763160d` | Gamestop |
| GSx | `0x3ee7e9b3a992fd23cd1c363b0e296856b04ab149` | Goldman Sachs |
| HONx | `0x62a48560861b0b451654bfffdb5be6e47aa8ff1b` | Honeywell |
| HOODx | `0xe1385fdd5ffb10081cd52c56584f25efa9084015` | Robinhood |
| HUTx | `0x560deb3d70ac90064ff809349cdf9a771a06fd36` | Hut 8 |
| IBMx | `0xd9913208647671fe0f48f7f260076b2c6f310aac` | IBM |
| IEMGx | `0x6a668332825450acd2e449372057d31b3de16a1e` | Core MSCI Emerging Markets |
| IJRx | `0xaa28cb97d7f7e172f54dee950743886d2d65447d` | S&P Small Cap |
| INTCx | `0xf8a80d1cb9cfd70d03d655d9df42339846f3b3c8` | Intel |
| ITAx | `0x375b9f00a83132cabcda7abf2bfc87c14f7ac324` | iShares U.S. Aerospace & Defense ETF |
| IWMx | `0xdadfb355c6110eda0908740d52c834d6c2bcddc7` | Russell 2000 |
| KLACx | `0xb7e2e3ef9f5c6b72a162ffc76382e4477a44d913` | KLA Corporation |
| KRAQx | `0x0ebe5fad0998765187fc695b75d4115c27c953a1` | KRAQ |
| LITEx | `0xaaa9cf4e9488f5eef064b8cfac70f5fd857669dc` | Lumentum Holdings |
| LRCXx | `0x4177d16a5d2465cf4bd52e07c1c56ab500243fd4` | Lam Research |
| MARAx | `0x9d692bffef6f6bedf4274053ff9998efe3b2539e` | MARA |
| MCDx | `0x80a77a372c1e12accda84299492f404902e2da67` | McDonald's |
| MDTx | `0x0588e851ec0418d660bee81230d6c678daf21d46` | Medtronic |
| MOOx | `0x06a0138f8c3e5110fd98e34a4473fb08f1304b87` | VanEck Agribusiness ETF |
| MRVLx | `0xeaad46f4146ded5a47b55aa7f6c48c191deaec88` | Marvell |
| MSTRx | `0xae2f842ef90c0d5213259ab82639d5bbf649b08e` | MicroStrategy |
| MUx | `0xf6a873bae4ba1b304e45df52a4b7d176e1c6a8c4` | Micron Technology |
| NFLXx | `0xa6a65ac27e76cd53cb790473e4345c46e5ebf961` | Netflix |
| OKLOx | `0x4b0ee7c047d43ca403239f28f42115bedb7c0076` | Oklo |
| OPENx | `0xbee6b69345f376598fe16abd5592c6f844825e66` | OPEN |
| PALLx | `0x05473cea3774d898c7b6dda21e1876d6bca7277b` | abrdn Physical Palladium |
| PANWx | `0xe12bb32d77be4db10ddc82088b230d35d097e9c5` | Palo Alto Networks |
| PLTRx | `0x6d482cec5f9dd1f05ccee9fd3ff79b246170f8e2` | Palantir |
| PLx | `0x536825370f1159cba953055f5c2f16ddc7b5a348` | Planet Labs |
| PMx | `0x02a6c1789c3b4fdb1a7a3dfa39f90e5d3c94f4f9` | Philip Morris |
| PPLTx | `0x8e9e4a8d7f1c65dcb42d9103832b27e75946055d` | abrdn Physical Platinum |
| PWRx | `0x90561f53a83d97c383e4842960969a6d9cfe1ba9` | Quanta Services |
| PYPLx | `0xf706585e7e8900be0267bee3b9a2f70835ec6628` | PayPal |
| QQQx | `0xa753a7395cae905cd615da0b82a53e0560f250af` | Nasdaq |
| RBLXx | `0x5d8da1417e3565eb02c9ca8cc588be5d8f65b1c5` | Roblox |
| RIOTx | `0x6ac47387f0a2798df4c4ee5bb31ab9517ac97cb8` | Riot Platforms |
| SBETx | `0x338791c58fded314b81eab139a1a2fb7967d90d6` | SharpLink Gaming |
| SCHFx | `0xf6d87e523512704c29e9b7ca3e9e6226bdce3ea1` | Schwab International Equity |
| SGOVx | `0x2dafa4732c8c1b25701a33b05f10f437f9599326` | iShares 0-3 Month Treasury Bond ETF |
| SLMTx | `0xe0f324a026ca55492637009d98034103db4a6967` | Brera |
| SLVx | `0x4833e7f4f0460f4b72a3a5879a6c9841bcc5b58b` | iShares Silver Trust |
| SMCIx | `0x39c31fc6038490ea4bf8a21ca18cd18f33b8d3fb` | Super Micro Computer |
| SMHx | `0x8d512a03600981b8e86556fd5c0fbdd726fe1821` | VanEck Semiconductor ETF |
| SMRx | `0xf8228d64435b55687157a5c9b132642fe04ac381` | NuScale Power |
| SNDKx | `0xb63efbc28860c8097e341de1fcf59456161e9d98` | Sandisk |
| SPCEx | `0x7f8ba411ecbc0a135d669d5eae5d15b0ca0b0ea1` | Virgin Galactic |
| SPYx | `0x90a2a4c76b5d8c0bc892a69ea28aa775a8f2dd48` | SP500 |
| STRCx | `0x1aad217b8f78dba5e6693460e8470f8b1a3977f3` | Strategy PP Variable |
| STRKx | `0x38e0445308e7fcd5230f2df6b52b36dd4ff313b6` | Strategy PP Fixed |
| TBLLx | `0x4cbf89ed7bb30b8a860fa86d3c96e9c72931299b` | TBLL |
| TERx | `0x99a1a9bc796bae48631a15b1c1889625c86b7b98` | Teradyne |
| TMUSx | `0x68f3ddee8bae33691e7cd0372984fd857e842760` | T-Mobile |
| TONXx | `0xe95ab205e333443d7970336d5fd827ef9ed97608` | TON |
| TQQQx | `0xfdddb57878ef9d6f681ec4381dcb626b9e69ac86` | TQQQ |
| TSMx | `0x9e3bf4ecfc44eedd624f26656b6736a3f093b073` | TSMC |
| UBERx | `0xdb9783ca04bbd64fe2c6d7b9503a979b3de30729` | Uber |
| URAx | `0x0e6607ab45d2ca779068cd6d9426c409773969fd` | Global X Uranium ETF |
| USARx | `0x6ee270d24b593f85863e95b6a7dd916a5957719f` | USA Rare Earth |
| UUUUx | `0xed579847e45b0c48cfd608da829073b2f7e65cf0` | Energy Fuels |
| VCXx | `0xbac2588d2272ff6e5826e2882042fa2926039cba` | Fundrise Innovation Fund |
| VGKx | `0x9337a8f11f777cdaa310b5682b09b44ed8bdcbad` | Vanguard FTSE Europe ETF |
| VRTx | `0x0a62db029ab8dc0b49b3e8159431728dbd23c7bf` | Vertiv Holdings |
| VTIx | `0xbd730e618bcd88c82ddee52e10275cf2f88a4777` | Vanguard Total Stock Market |
| VTx | `0x6d5edeebbc6a4099eb8bb289eb3b80d799f7b28c` | Vanguard Total World |
| VUGx | `0x6e0aafb414b620e096b9f7fe85625d3e5ce41d3f` | Vanguard Growth ETF |
| VXUSx | `0x91ea54a8a5426c0a0bea55968dd71abce7b92751` | Vanguard Total International Stock ETF |
| WBDx | `0xc435b3c41ae56d9bc57b8525f4d522c978f168e8` | Warner Bros. Discovery |
| WULFx | `0xc0c2150cf0870e2d7abc7cde17c20a542fafbb9b` | TeraWulf |
| XLEx | `0x6f75ac3b1b6fbe8bb5f948e25af03620f26ae838` | Energy Select Sector SPDR Fund |
| XOPx | `0x6b9cca56e783d1345785e4aa1188bbd673e911a2` | SPDR S&P Oil & Gas Exploration & Production ETF |

## Dependencies

Ask before installing new dependencies.
