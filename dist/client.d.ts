import type { SubscribeFormConfig } from './types';
export type { SubscribeFormConfig, SubscribeFormFieldKey } from './types';
export { SUBSCRIBE_FORM_FIELD_KEYS } from './types';
export { isSubscribeFieldVisible, isSubscribeFieldRequired, subscribeFieldText, subscribeFieldLabel, mergeSubscribeFormConfig, isSubscribeFormFieldKey, normalizeBrandDomain, domainToBrandSlug, getSubscribeFormConfigIssues, isSubscribeFormConfigCoherent, } from './helpers';
/**
 * Client helper when config was not passed from a Server Component.
 * Prefers `/api/subscription/form-config`, falls back to `initial` or `fallback`.
 */
export declare function useSubscribeFormConfig(initial?: SubscribeFormConfig, fallback?: SubscribeFormConfig): SubscribeFormConfig | undefined;
