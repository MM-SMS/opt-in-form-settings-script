import type { SubscribeFormConfig, SubscribeFormFieldKey } from './types'
import { SUBSCRIBE_FORM_FIELD_KEYS } from './types'

export function isSubscribeFieldVisible(
  config: SubscribeFormConfig,
  key: SubscribeFormFieldKey,
): boolean {
  return config[key]?.visible !== false
}

export function subscribeFieldText(
  config: SubscribeFormConfig,
  key: SubscribeFormFieldKey,
  fallback = '',
): string {
  const text = config[key]?.text?.trim()
  return text || fallback
}

export function mergeSubscribeFormConfig(
  base: SubscribeFormConfig,
  overrides: Partial<Record<SubscribeFormFieldKey, Partial<{ visible: boolean; text: string }>>>,
): SubscribeFormConfig {
  const next = { ...base }
  for (const key of SUBSCRIBE_FORM_FIELD_KEYS) {
    const patch = overrides[key]
    if (!patch) continue
    next[key] = {
      visible: patch.visible ?? base[key].visible,
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

/**
 * Config coherence vs typical subscribe API rules. Broken Notion rows fall back to full defaults.
 *
 * - firstName + lastName must stay visible (API requires both)
 * - cbTerms must stay visible (API requires termsPrivacyAccepted)
 * - email visible ↔ cbEmail visible
 * - phone visible → cbSms visible (API requires informational SMS when phone is set)
 * - cbSms or cbMarketing visible → phone visible
 */
export function getSubscribeFormConfigIssues(config: SubscribeFormConfig): string[] {
  const v = (key: SubscribeFormFieldKey) => isSubscribeFieldVisible(config, key)
  const issues: string[] = []

  if (!v('firstName')) issues.push('firstName_visible is off — API requires firstName')
  if (!v('lastName')) issues.push('lastName_visible is off — API requires lastName')
  if (!v('cbTerms')) issues.push('cbTerms_visible is off — API requires termsPrivacyAccepted')

  if (v('email') && !v('cbEmail'))
    issues.push('email is visible but cbEmail is hidden — email without consent → API 400')
  if (v('cbEmail') && !v('email'))
    issues.push('cbEmail is visible but email is hidden — consent without email field')

  if (v('phone') && !v('cbSms'))
    issues.push('phone is visible but cbSms is hidden — phone without info SMS consent → API 400')
  if (v('cbSms') && !v('phone')) issues.push('cbSms is visible but phone is hidden')
  if (v('cbMarketing') && !v('phone')) issues.push('cbMarketing is visible but phone is hidden')

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
  if (issues.length === 0) return { config, usedFallback: false, issues }

  console.warn(
    '[subscribe-form-config] Invalid Notion visibility — using default form:\n- ' +
      issues.join('\n- '),
  )
  return { config: fallback, usedFallback: true, issues }
}
