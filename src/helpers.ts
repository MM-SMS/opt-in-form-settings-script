import type { SubscribeFormConfig, SubscribeFormFieldKey } from './types'
import { SUBSCRIBE_FORM_FIELD_KEYS } from './types'

type FieldPatch = Partial<{ visible: boolean; required: boolean; text: string }>

export function isSubscribeFieldVisible(
  config: SubscribeFormConfig,
  key: SubscribeFormFieldKey,
): boolean {
  return config[key]?.visible !== false
}

export function isSubscribeFieldRequired(
  config: SubscribeFormConfig,
  key: SubscribeFormFieldKey,
): boolean {
  if (!isSubscribeFieldVisible(config, key)) return false
  return config[key]?.required === true
}

export function subscribeFieldText(
  config: SubscribeFormConfig,
  key: SubscribeFormFieldKey,
  fallback = '',
): string {
  const text = config[key]?.text?.trim()
  return text || fallback
}

/** Label/copy with a trailing * when Notion marks the field required. */
export function subscribeFieldLabel(
  config: SubscribeFormConfig,
  key: SubscribeFormFieldKey,
  fallback = '',
): string {
  const raw = subscribeFieldText(config, key, fallback).replace(/\s*\*+\s*$/, '').trim()
  if (!raw) return isSubscribeFieldRequired(config, key) ? '*' : ''
  return isSubscribeFieldRequired(config, key) ? `${raw} *` : raw
}

export function mergeSubscribeFormConfig(
  base: SubscribeFormConfig,
  overrides: Partial<Record<SubscribeFormFieldKey, FieldPatch>>,
): SubscribeFormConfig {
  const next = { ...base }
  for (const key of SUBSCRIBE_FORM_FIELD_KEYS) {
    const patch = overrides[key]
    if (!patch) continue
    next[key] = {
      visible: patch.visible ?? base[key].visible,
      required: patch.required ?? base[key].required,
      text: patch.text?.trim() ? patch.text : base[key].text,
    }
  }
  return next
}

export function isSubscribeFormFieldKey(value: string): value is SubscribeFormFieldKey {
  return (SUBSCRIBE_FORM_FIELD_KEYS as readonly string[]).includes(value)
}

/**
 * Strip protocol/www/path: `https://www.Lavessia.org/` → `lavessia.org`.
 * Notion "Brand" stores the real domain with dots; we normalize before slugifying.
 */
export function normalizeBrandDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

/**
 * Notion Brand cell may be `lavessia.org`; match key is underscore form.
 * `lavessia.org` → `lavessia_org`
 */
export function domainToBrandSlug(domain: string): string {
  return normalizeBrandDomain(domain).replace(/\./g, '_')
}

/** Notion checkbox column next to each field text column, e.g. `phone` → `phone_visible`. */
export function visibleColumnName(field: SubscribeFormFieldKey): string {
  return `${field}_visible`
}

/** Notion checkbox: `phone` → `phone_required`. */
export function requiredColumnName(field: SubscribeFormFieldKey): string {
  return `${field}_required`
}

/**
 * Config coherence vs typical subscribe API rules. Broken Notion rows fall back to full defaults.
 *
 * - firstName + lastName must stay visible (payload still sent; required is a separate flag)
 * - cbTerms must stay visible
 * - email visible ↔ cbEmail visible
 * - phone visible → cbSms visible (API requires informational SMS when phone is set)
 * - cbSms or cbMarketing visible → phone visible
 * - required on a hidden field is ignored at runtime; flagged here so the row can be fixed
 */
export function getSubscribeFormConfigIssues(config: SubscribeFormConfig): string[] {
  const v = (key: SubscribeFormFieldKey) => isSubscribeFieldVisible(config, key)
  const issues: string[] = []

  if (!v('firstName')) issues.push('firstName_visible is off — hide names only if the site API allows empty names')
  if (!v('lastName')) issues.push('lastName_visible is off — hide names only if the site API allows empty names')
  if (!v('cbTerms')) issues.push('cbTerms_visible is off — hide terms only if the site API allows missing terms')

  if (v('email') && !v('cbEmail'))
    issues.push('email is visible but cbEmail is hidden — email without consent → API 400')
  if (v('cbEmail') && !v('email'))
    issues.push('cbEmail is visible but email is hidden — consent without email field')

  if (v('phone') && !v('cbSms'))
    issues.push('phone is visible but cbSms is hidden — phone without info SMS consent → API 400')
  if (v('cbSms') && !v('phone')) issues.push('cbSms is visible but phone is hidden')
  if (v('cbMarketing') && !v('phone')) issues.push('cbMarketing is visible but phone is hidden')

  for (const key of SUBSCRIBE_FORM_FIELD_KEYS) {
    if (config[key]?.required && !v(key)) {
      issues.push(`${key}_required is on but ${key} is hidden — required is ignored while hidden`)
    }
  }

  return issues
}

export function isSubscribeFormConfigCoherent(config: SubscribeFormConfig): boolean {
  return getSubscribeFormConfigIssues(config).length === 0
}

/** If Notion visibility breaks submit rules, return the built-in full form. */
export function resolveSubscribeFormConfig(
  config: SubscribeFormConfig,
  fallback: SubscribeFormConfig,
): { config: SubscribeFormConfig; usedFallback: boolean; issues: string[] } {
  const issues = getSubscribeFormConfigIssues(config)
  const blocking = issues.filter((issue) => !issue.includes('_required is on but'))
  if (blocking.length === 0) return { config, usedFallback: false, issues }

  console.warn(
    '[subscribe-form-config] Invalid Notion visibility — using default form:\n- ' +
      blocking.join('\n- '),
  )
  return { config: fallback, usedFallback: true, issues: blocking }
}
