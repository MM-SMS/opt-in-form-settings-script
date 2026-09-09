# AI install prompt — subscribe-form-config

Copy everything below into Cursor on a **new brand site**.

---

```
Implement Notion-driven subscribe form field visibility, required flags, and copy using the shared GitHub package `subscribe-form-config` (same pattern as Lavessia / brand-template).

## 1. Install
```bash
npm i github:MM-SMS/opt-in-form-settings-script#main @notionhq/client
```

Env (`.env.example`, `.env.local`, Vercel Preview + Production):
```
NOTION_TOKEN=
NOTION_SUBSCRIBE_FORM_DB_ID=
```
No `BRAND_SLUG`. Brand match = `domainToBrandSlug(BRAND.domain)`:
- Notion Brand cell = real domain with dots, e.g. `thisbrand.com`
- Code normalizes `.` → `_` → `thisbrand_com`

## 2. Site adapter (required)
Create `lib/subscribe-form-config.ts` (server-safe exports stay in a server file):

`lib/subscribe-form-server.ts`:
```ts
import { createSubscribeFormConfig } from 'subscribe-form-config/server'
import { BRAND } from '@/lib/constants'
// Optional: import site-specific consent strings and pass via getDefaultTexts

export const {
  getSubscribeFormConfig,
  getSubscribeFormConfigFresh,
  getSubscribeFormConfigResultFresh,
  getDefaultSubscribeFormConfig,
  formConfigGetHandler,
} = createSubscribeFormConfig({
  getBrand: () => ({
    name: BRAND.name,
    domain: BRAND.domain,
    legalEntity: BRAND.legalEntity,
  }),
  getDefaultTexts: () => ({
    // optional overrides; empty = package generic consent copy
  }),
})
```

`GET /api/subscription/form-config`:
```ts
import { formConfigGetHandler } from '@/lib/subscribe-form-server'
export const dynamic = 'force-dynamic'
export async function GET() {
  return formConfigGetHandler()
}
```

Do **not** import `subscribe-form-config/server` or `getSubscribeFormConfig` from Client Components.
Client: `import { useSubscribeFormConfig, isSubscribeFieldVisible, isSubscribeFieldRequired, subscribeFieldLabel } from 'subscribe-form-config/client'`
Or pass `formConfig` from a Server Component.

## 3. Wire the existing subscribe UI (do not restyle)
Keep this site's form JSX/styles. Only:
- accept optional `formConfig?: SubscribeFormConfig`
- render a field only if `isSubscribeFieldVisible(config, key)`
- use `subscribeFieldLabel(config, key, fallback)` for labels / checkbox copy (adds * when required)
- require a field only if `isSubscribeFieldRequired(config, key)` (hidden ⇒ not required)
- submit payload shape **unchanged**: hidden text → `''`, hidden checkbox → `false`

Field keys (Notion + form):
`firstName`, `lastName`, `email`, `phone`, `cbEmail`, `cbSms`, `cbMarketing`, `cbTerms`

Typical mapping to API:
- `cbEmail` → `emailConsent`
- `cbSms` → `smsAutoConsent`
- `cbMarketing` → `smsMarketingConsent`
- `cbTerms` → `termsPrivacyAccepted`

Server: `const formConfig = await getSubscribeFormConfig()` on `/subscribe` (and pass into modal).
Auto-modal: `useSubscribeFormConfig()` so root layout does **not** fetch Notion (avoids homepage ISR `/index` header bugs).

## 4. Validation rules (skip if field hidden)
- firstName / lastName / email / phone / consents / terms: required only when `*_required` is on **and** the field is visible
- Code defaults: firstName, lastName, cbTerms required; email, phone, cbEmail, cbSms, cbMarketing optional
- Pairing still applies even if a field is optional:
  - email filled → `cbEmail` required (if both visible)
  - `cbEmail` checked → email required
  - phone filled → `cbSms` required (if both visible)
  - `cbSms` or `cbMarketing` checked → phone required
- Turnstile still required
- Subscribe API should use the same `isSubscribeFieldRequired` checks so Notion optional names/terms do not 400

## 5. Automatic fallback
Package already falls back to the **full default form** if Notion visibility is incoherent:
- names + terms must be visible
- email ↔ cbEmail (both on or both off)
- phone → cbSms on
- cbSms / cbMarketing → phone on

`*_required` on a hidden field is ignored (does not trigger fallback).

Debug: `GET /api/subscription/form-config` → `meta.usedFallback`, `meta.issues`, `config.*.visible`, `config.*.required`.

## 6. Constraints
- Do not change subscribe/unsubscribe API payload keys
- Do not restyle the form or rewrite Resend/Textbelt/Turnstile
- If Notion env missing or fetch fails → built-in defaults (all fields visible)
- Preserve brand-specific JSX; only gate render + swap text

## 7. Notion row for this site
Add/select Brand = this site's domain (e.g. `example.com`). Toggle `*_visible` and `*_required`. Empty text cells keep code defaults.

## Done when
- With a valid Notion row, `*_visible` shows/hides fields
- `*_required` makes a visible field required or optional
- Text columns override labels/checkbox copy
- Broken visibility pairs → full default form (no 400 from missing consent)
- Without Notion env, form behaves as before (names + terms required)
```
