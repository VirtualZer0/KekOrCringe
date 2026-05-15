# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Main working rules

## Rule 1 — Think Before Coding

State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

## Rule 2 — Simplicity First

Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

## Rule 3 — Surgical Changes

Touch only what you must. Clean up only your own mess.
Don't "improve" adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

## Rule 4 — Goal-Driven Execution

Define success criteria. Loop until verified.
Don't follow steps. Define success and iterate.
Strong success criteria let you loop independently.

## Rule 5 — Use the model only for judgment calls

Use me for: classification, drafting, summarization, extraction.
Do NOT use me for: routing, retries, deterministic transforms.
If code can answer, code answers.

## Rule 6 — Token budgets are not advisory

Per-task: 4,000 tokens. Per-session: 30,000 tokens.
If approaching budget, summarize and start fresh.
Surface the breach. Do not silently overrun.

## Rule 7 — Surface conflicts, don't average them

If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

## Rule 8 — Read before you write

Before adding code, read exports, immediate callers, shared utilities.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

## Rule 9 — Tests verify intent, not just behavior

Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

## Rule 10 — Checkpoint after every significant step

Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

## Rule 11 — Match the codebase's conventions, even if you disagree

Conformance > taste inside the codebase.
If you genuinely think a convention is harmful, surface it. Don't fork silently.

## Rule 12 — Fail loud

"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.


## Commands

Package manager is **npm** (`package-lock.json` is checked in).

- `npm install` — install dependencies
- `npm run dev` / `npm run serve` — Vite dev server with HMR (port 8080, `strictPort: false` so it falls through if busy)
- `npm run build` — `vue-tsc --noEmit` then `vite build` (base `/KekOrCringe/` for GitHub Pages, see `vite.config.ts`)
- `npm run preview` — local preview of the production build
- `npm run type-check` — `vue-tsc --noEmit` only
- `npm run lint` — ESLint 9 (flat config in `eslint.config.js`) + Prettier autofix

There is **no test suite**. Type errors surface via `npm run type-check` (also run as part of `npm run build`).

CI (`.github/workflows/main.yml`) deploys to GitHub Pages on push to `master` using the official `actions/configure-pages` + `actions/deploy-pages` workflow. Repo Settings → Pages → Source must be set to **GitHub Actions** for the deploy to land. Manual runs via `workflow_dispatch` are enabled.

## Architecture

Single-page Vue 3 + TypeScript app that gates Twitch viewers' video submissions (YouTube, TikTok, Twitch clips) through a live "kek or cringe" chat vote. The whole app is **client-only** — no backend; everything persists in `localStorage`.

### Page flow (linear)

`MainPage` → `SettingsPage` → `RunPage` → `EndPage`, wired in `src/router/index.ts` using **hash history** (`createWebHashHistory`) so GitHub Pages can serve it. Page components live in `src/pages/`.

`App.vue` intercepts every route change to play a `CircleAnim` color-wipe transition: each route declares a `meta.color`, the outgoing anim uses the previous color, the incoming uses the next. Navigation is delayed `ROUTE_ANIM_MS` (~210ms) so the wipe lands before the page mounts. Navigations to `Main` are special-cased to bypass the wipe (instant `next()`). Pending timers are tracked so a fast re-navigation supersedes the previous animation's state changes instead of letting stale timeouts fire against the newer route.

### State and persistence

`src/store.ts` exports a single Pinia store (`useStore`) that **must be manually persisted** — call `store.save()` after mutations, and `store.load()` runs once from `main.ts` on boot. The whole `$state` is JSON-serialized to `localStorage['store']`. The store covers config (channel, video settings, variants), rewards/emote caches, and session toggles (`sfxMuted`, `skipPoints`).

`videoSettings.enabledPlatforms` is the list of `VideoPlatform` values (`'youtube' | 'tiktok' | 'twitch'`) that accept submissions during a run — used by `extractVideoLink` to gate URL matching.

Statistics and the live video queue are stored **separately** from the Pinia store (intentional — they're tied to a run, not config):

- `localStorage['statistics']` — managed via `src/utils/statisticsUtils.ts`; `{ allTime, current }` shape. `current` is reset only by `SettingsPage`'s Run button (explicit "new run"). `RunPage` reads it with `getStatistics(false)` so an accidental reload mid-run doesn't wipe the current-run block.
- `localStorage['videoList']` — `Record<videoId, IVideoData>`, owned by the `useVideoQueue` composable (`src/composables/useVideoQueue.ts`). Use the composable's `add` / `remove` / `clear` / `updateDuration` rather than touching `localStorage` directly.
- `localStorage['lang']` — i18n override; resolution lives in `src/utils/locale.ts` (`getInitialLang()` → saved → `navigator.language` prefix → `'en'`).

### Twitch chat integration

`src/utils/useChat.ts` is a **module-level singleton**, not a real Vue composable — listener arrays and the `tmi.Client` live in module scope. Calling `useChat()` returns the same `create / connect / destroy / on / off` handles. `destroy()` removes all listeners, disconnects, and resets internal state — call it from `onBeforeUnmount` (RunPage does).

Events: `Reward` (chat messages with `custom-reward-id`), `Message` (regular chat), `Bits` (cheers), `Connected` (one-shot connect toast), `Error` (fires once per outage, then suppressed until the next successful connect to prevent toast spam). Reconnect uses exponential backoff `[500, 1000, 2000, 5000, 10000, 30000]` ms indexed by attempt count. An intentional `destroy()` nulls the `chat` reference so the `'disconnected'` handler bails out instead of scheduling a retry.

### Vote mechanics (`RunPage.vue`)

Three trigger methods configured via `videoSettings.addVideoMethod`: `message` / `reward` / `bits`. `handleUserMessage` only accepts video submissions matching the current method; everything else is tested against `variantsSettings` to record a vote.

Video URLs are detected by `extractVideoLink(msg, enabledPlatforms)` from `src/utils/videoSources/index.ts`, then metadata is fetched via `fetchVideoMetadata`. Submissions are deduped by `platform:id` while the fetch is in flight (via a `pendingFetches` set), with a fallback to the URL string for shortlinks that can't be resolved synchronously.

`currentVote.skipCount` starts at `videoSettings.skipCount` and accumulates each variant's `skipModifier` per vote (`kek` is `-1`, `cringe` is `+1`). Hitting `<= 0` ends the round. A user's previous vote is removed before adding the new one — users can change their mind.

The `kek` and `cringe` variants are `permanent: true` and must not be deleted; statistics, the "strong winner" check, and the final tally all reference them by literal name. Additional user-defined variants are allowed and participate in voting, but never become the winner unless they outvote both `kek` and `cringe`. A "strong" win means the winner had a complete shutout (every other variant got 0 votes). A `kek`/`cringe` tie that no custom variant exceeds produces a `neutral` result — not credited to either side's statistics, but still increments `allVideos`.

### Video source adapters

`src/utils/videoSources/` implements a platform-pluggable adapter pattern. Each platform exposes an `IVideoSourceAdapter` (see `types.ts`) with `hostRegex`, optional sync `extractId`, async `fetchMetadata`, and `buildEmbedSrc`. Adapters are registered in `index.ts`'s `adapters` record keyed by `VideoPlatform`. To add a new platform: create a new adapter file, add the key to `VideoPlatform`, register it in `adapters`, and include it in the default `videoSettings.enabledPlatforms` in `src/store.ts`.

`badWords.ts` exposes `containsBadWord(title)` — every adapter calls it when `options.filterBadwords` is set and `bypassChecks` is not.

`UniversalPlayer.vue` (used by `RunPage`) renders the right embed component per platform — `<youtube-video>` / `<tiktok-video>` custom elements (declared in `vite.config.ts` as `isCustomElement`), and `TwitchClipPlayer.vue` for Twitch clips.

### External API access (no auth)

- **YouTube Data API v3** — key is obfuscated in `src/utils/videoSources/youtube.ts` (`apiKey` constant) and decoded at call time via `@`→`a`, `!`→`0`, then reversed. The literal `AIza…` prefix never appears in source/bundle, so trivial GitHub-wide scrapers won't pick it up. Real protection comes from HTTP-referrer + API restrictions in Google Cloud Console — don't hardcode a new key elsewhere.
- **TikTok oEmbed + shortlink resolution** — `src/utils/videoSources/tiktok.ts` resolves `vm.tiktok.com` / `vt.tiktok.com` / `tiktok.com/t/...` shortlinks by trying a chain of public CORS proxies (`allorigins.win`, `corsproxy.io`, `codetabs.com`, `cors.lol`) before hitting TikTok's public oEmbed endpoint. Any proxy can break independently; each call has a 4s timeout and the chain falls through. Direct canonical URLs (`tiktok.com/@user/video/123`) bypass the proxy chain entirely.
- **Twitch clips GraphQL** — `src/utils/videoSources/twitch.ts` uses the public web client-id `kimne78kx3ncx6brgo4mv6wki5h1ko` to fetch clip metadata via a normal GraphQL query (no persisted hash). Embeds require `parent=<hostname>` and won't work from raw IPs — `localhost` is fine.
- **Twitch channel-point rewards** — `src/utils/getTwitchRewards.ts` uses the same public client-id with a **persisted-query SHA256 hash** to fetch a channel's custom rewards. The hash may break if Twitch rotates it.
- **BTTV / FFZ / 7TV** — public emote endpoints called from `SettingsPage.vue` once `twitchId` is known. Each is wrapped in its own `try/catch` and surfaces failures via a toast; do not gate the run on emote load. 7TV emotes are stored under `emotesCache.stv` (the field is named `stv`, not `7tv`).

### i18n

`vue-i18n` with `legacy: false`. Locales live in `src/locales/{en,ru}/main.ts` and are aggregated in `src/locales/index.ts`. Use `$t('key')` in templates and `useI18n()` in `<script setup>`. When adding a string, add it to **both** `en` and `ru`. Initial language resolution is in `src/utils/locale.ts`.

### UI conventions

- **shadcn-vue** for components — copy-pasted source under `src/components/ui/<name>/`, registered via the `components.json` at repo root. Import per-file, e.g. `import { Button } from '@/components/ui/button'`. Add new ones via `npx shadcn-vue@latest add <name>` (style: `new-york`, base color: `neutral`).
- In-house UI primitives that have no shadcn equivalent: `src/components/ui/chip` (removable pill) and `src/components/ui/color-picker` (native `<input type="color">` wrapper).
- **Toasts**: `vue-sonner` under the hood, but always go through `@/utils/notify` — `notify.success/error/warning/info(title, { description, duration, action? })`. The wrapper renders a custom `AppToast.vue` component for consistent styling. `<Toaster />` is mounted once in `App.vue`.
- **Confirm dialogs**: centered `<AlertDialog>` from `@/components/ui/alert-dialog` driven by a local `v-model:open` ref — there is no anchored-popover confirm composable.
- **Icons**: `lucide-vue-next`. Import per icon and render as `<IconName class="size-4" />`.
- **Path alias**: `@/*` → `src/*` (configured in `tsconfig.json`, `vite.config.ts`, and `components.json`). The `cn(...)` class-merge helper lives at `@/lib/utils`.
- **Styling**: Tailwind v4 (configured in `src/assets/style/main.css` via `@import "tailwindcss"` + `@theme inline { … }`). Prefer Tailwind utilities for layout, spacing, typography, and basic colors. Brand colors `--c1`…`--c5` are exposed both as CSS vars (in `colors.css`) and as Tailwind utilities (`bg-c1`, `text-c5`, …). Keep complex bespoke styles (animations, multi-stop gradients, custom positioning, particle effects) in scoped `<style>` blocks. `@keyframes` must stay at top-level (not nested inside selectors). Page-transition animation classes live in `src/assets/style/anim.css`.
- ESLint enforces single quotes, no semicolons-via-prettier, `singleAttributePerLine`, `arrowParens: always`.
