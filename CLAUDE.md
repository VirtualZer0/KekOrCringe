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

Package manager is **yarn** (see README; `package-lock.json` is also checked in for CI).

- `yarn install` — install dependencies
- `yarn serve` / `yarn dev` — dev server with HMR (both alias `vue-cli-service serve`)
- `yarn build` — production build (publicPath `/KekOrCringe/` for GitHub Pages, see `vue.config.js`)
- `yarn lint` — ESLint + Prettier autofix via `vue-cli-service lint`

There is **no test suite** and no typecheck script — type errors only surface during build. Run `yarn build` to catch them.

CI (`.github/workflows/main.yml`) runs on every push and deploys to GitHub Pages via `thefrustrateddev/vue-deploy-github-pages@v1.0.0`.

## Architecture

Single-page Vue 3 + TypeScript app that gates Twitch viewers' YouTube submissions through a live "kek or cringe" chat vote. The whole app is **client-only** — no backend; everything persists in `localStorage`.

### Page flow (linear)

`MainPage` → `SettingsPage` → `RunPage` → `EndPage`, wired via `vue-router` with **hash history** (`createWebHashHistory`) so GitHub Pages can serve it.

`App.vue` intercepts every route change to play a `CircleAnim` color-wipe transition: each route declares a `meta.color`, the outgoing anim uses the previous color, the incoming uses the next. Navigation is delayed ~210ms so the wipe lands before the page mounts.

### State and persistence

`src/store.ts` exports a single Pinia store (`useStore`) that **must be manually persisted** — call `store.save()` after mutations, and `store.load()` runs once from `main.ts` on boot. The whole `$state` is JSON-serialized to `localStorage['store']`.

Statistics and the live video queue are stored **separately** from the Pinia store (intentional — they're tied to a run, not config):

- `localStorage['statistics']` — managed via `src/utils/statisticsUtils.ts`; `{ allTime, current }` shape, `current` resets each run
- `localStorage['videoList']` — `Record<videoId, IVideoData>`, written directly from `RunPage.vue`
- `localStorage['users']` — submitter metadata, written from `RunPage.vue`
- `localStorage['lang']` — i18n override (otherwise falls back to `navigator.language`, then `en`)

### Twitch chat integration

`src/utils/useChat.ts` is a **module-level singleton**, not a real Vue composable — listener arrays and the `tmi.Client` live in module scope. Calling `useChat()` returns the same `create / connect / on / off` handles. Re-entering `RunPage` reuses the same client; remember to `chat.off(...)` on `onBeforeUnmount` (current code does).

Events: `Reward` (chat messages with `custom-reward-id`), `Message` (regular messages), `Bits` (cheers). The client auto-reconnects on `disconnected` with a 500ms backoff.

### Vote mechanics (`RunPage.vue`)

Three trigger methods configured via `videoSettings.addVideoMethod`: `message` / `reward` / `bits`. `handleUserMessage` only accepts video submissions matching the current method; everything else is tested against `variantsSettings` to record a vote.

`currentVote.skipCount` starts at `videoSettings.skipCount` and accumulates each variant's `skipModifier` per vote (`kek` is `-1`, `cringe` is `+1`). Hitting `<= 0` ends the round. A user's previous vote is removed before adding the new one — users can change their mind.

The `kek` and `cringe` variants are `permanent: true` and must not be deleted; statistics, the "strong winner" check, and the final tally all reference them by literal name. Additional user-defined variants are allowed and participate in voting, but never become the winner unless they outvote both `kek` and `cringe`.

### External API access (no auth)

- **YouTube Data API v3** — key is obfuscated in `src/utils/YTUtils.ts` (`apiKey` constant) and decoded at call time via reverse + char substitution. Treat it as committed and rate-limited; do not hardcode a new key elsewhere.
- **Twitch GraphQL** (`src/utils/getTwitchRewards.ts`) — uses the **public web client-id** `kimne78kx3ncx6brgo4mv6wki5h1ko` with a persisted-query hash to fetch channel custom rewards. This is unauthenticated and may break if Twitch rotates the hash.
- **BTTV / 7TV / FFZ** — public emote endpoints called from `SettingsPage.vue` once `twitchId` is known. Each is wrapped in its own `try/catch` and feeds a Toast on failure; do not gate the run on emote load.

### i18n

`vue-i18n` with `legacy: false`. Locales live in `src/locales/{en,ru}/main.ts` and are aggregated in `src/locales/index.ts`. Use `$t('key')` in templates and `useI18n()` in `<script setup>`. When adding a string, add it to **both** `en` and `ru`.

### UI conventions

- **PrimeVue** for components (registered globally; import individual components per-file, e.g. `import Button from 'primevue/button'`)
- **PrimeVue services** wired in `main.ts`: `Toast` and `ConfirmPopup` are mounted once in `App.vue`; use `useToast()` / `useConfirm()` from PrimeVue
- **Path alias**: `@/*` → `src/*` (configured in both `tsconfig.json` and Vue CLI)
- **SCSS** is the styling default; component styles use `<style lang="scss" scoped>`; global theme vars `--c1`…`--c5` come from `@/assets/style/colors.scss`
- ESLint enforces single quotes, no semicolons-via-prettier, `singleAttributePerLine`, `arrowParens: always`
