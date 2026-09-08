import type { SubscribeFormConfig, SubscribeFormFieldKey } from './types';
export declare function isSubscribeFieldVisible(config: SubscribeFormConfig, key: SubscribeFormFieldKey): boolean;
export declare function subscribeFieldText(config: SubscribeFormConfig, key: SubscribeFormFieldKey, fallback?: string): string;
export declare function mergeSubscribeFormConfig(base: SubscribeFormConfig, overrides: Partial<Record<SubscribeFormFieldKey, Partial<{
    visible: boolean;
    text: string;
}>>>): SubscribeFormConfig;
export declare function isSubscribeFormFieldKey(value: string): value is SubscribeFormFieldKey;
/**
 * Strip protocol/www/path: `https://www.Lavessia.org/` → `lavessia.org`.
 * Notion "Brand" stores the real domain with dots; we normalize before slugifying.
 */
export declare function normalizeBrandDomain(domain: string): string;
/**
 * Notion Brand cell may be `lavessia.org`; match key is underscore form.
 * `lavessia.org` → `lavessia_org`
 */
export declare function domainToBrandSlug(domain: string): string;
/** Notion checkbox column next to each field text column, e.g. `phone` → `phone_visible`. */
export declare function visibleColumnName(field: SubscribeFormFieldKey): string;
/**
 * Config coherence vs typical subscribe API rules. Broken Notion rows fall back to full defaults.
 *
 * - firstName + lastName must stay visible (API requires both)
 * - cbTerms must stay visible (API requires termsPrivacyAccepted)
 * - email visible ↔ cbEmail visible
 * - phone visible → cbSms visible (API requires informational SMS when phone is set)
 * - cbSms or cbMarketing visible → phone visible
 */
export declare function getSubscribeFormConfigIssues(config: SubscribeFormConfig): string[];
export declare function isSubscribeFormConfigCoherent(config: SubscribeFormConfig): boolean;
/** If Notion visibility breaks submit rules, return the built-in full form. */
export declare function resolveSubscribeFormConfig(config: SubscribeFormConfig, fallback: SubscribeFormConfig): {
    config: SubscribeFormConfig;
    usedFallback: boolean;
    issues: string[];
};
