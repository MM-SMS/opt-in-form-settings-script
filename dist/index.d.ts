export type { CreateSubscribeFormConfigOptions, SubscribeFormBrand, SubscribeFormConfig, SubscribeFormConfigContext, SubscribeFormConfigResult, SubscribeFormDefaultTexts, SubscribeFormFieldConfig, SubscribeFormFieldKey, } from './types';
export { SUBSCRIBE_FORM_FIELD_KEYS } from './types';
export { buildDefaultSubscribeFormConfig, genericConsentCopy } from './defaults';
export { isSubscribeFieldVisible, subscribeFieldText, mergeSubscribeFormConfig, isSubscribeFormFieldKey, normalizeBrandDomain, domainToBrandSlug, visibleColumnName, getSubscribeFormConfigIssues, isSubscribeFormConfigCoherent, resolveSubscribeFormConfig, } from './helpers';
/** Server helpers: `import { createSubscribeFormConfig } from 'subscribe-form-config/server'` */
/** Client hook: `import { useSubscribeFormConfig } from 'subscribe-form-config/client'` */
