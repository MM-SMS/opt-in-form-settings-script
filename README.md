# subscribe-form-config

Notion-driven **subscribe form field visibility, required flags, and copy** for brand sites.

- Shared Notion database, **one row per brand**
- Brand cell = real domain (`lavessia.org`) → code matches `lavessia_org`
- Hidden fields still submit as `''` / `false` (do not change API payload shape)
- Each field can be required or optional via `{field}_required`
- Invalid visibility pairs automatically fall back to the full default form

Install:

```bash
npm i github:MM-SMS/opt-in-form-settings-script#main @notionhq/client
```

## Env

```
NOTION_TOKEN=
NOTION_SUBSCRIBE_FORM_DB_ID=
```

No `BRAND_SLUG` env.

## Notion columns

`Brand` (Select) + for each field `{field}` rich text + `{field}_visible` + `{field}_required` checkboxes:

`firstName`, `lastName`, `email`, `phone`, `cbEmail`, `cbSms`, `cbMarketing`, `cbTerms`

- `*_visible`: ☑️ show · ☐ hide
- `*_required`: ☑️ required · ☐ optional (ignored if the field is hidden)
- empty text = code default

Code defaults: firstName, lastName, cbTerms **required**; email, phone, and other consents **optional**.

```ts
import { isSubscribeFieldVisible, isSubscribeFieldRequired, subscribeFieldLabel } from 'subscribe-form-config/client'
```

## Site wiring

See **[INSTALL_PROMPT.md](./INSTALL_PROMPT.md)** — paste into Cursor on a new brand site.

Server factory (Next.js only):

```ts
import { createSubscribeFormConfig } from 'subscribe-form-config/server'
import { BRAND } from '@/lib/constants'

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
})
```

Client:

```ts
import { useSubscribeFormConfig, isSubscribeFieldVisible, isSubscribeFieldRequired, subscribeFieldLabel } from 'subscribe-form-config/client'
```
