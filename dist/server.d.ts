import { NextResponse } from 'next/server';
import type { CreateSubscribeFormConfigOptions, SubscribeFormConfig, SubscribeFormConfigResult } from './types';
export type { CreateSubscribeFormConfigOptions, SubscribeFormBrand, SubscribeFormConfig, SubscribeFormConfigContext, SubscribeFormConfigResult, SubscribeFormDefaultTexts, SubscribeFormFieldConfig, SubscribeFormFieldKey, } from './types';
export { SUBSCRIBE_FORM_FIELD_KEYS } from './types';
export { buildDefaultSubscribeFormConfig, genericConsentCopy } from './defaults';
export { isSubscribeFieldVisible, isSubscribeFieldRequired, subscribeFieldText, subscribeFieldLabel, mergeSubscribeFormConfig, isSubscribeFormFieldKey, normalizeBrandDomain, domainToBrandSlug, visibleColumnName, requiredColumnName, getSubscribeFormConfigIssues, isSubscribeFormConfigCoherent, resolveSubscribeFormConfig, } from './helpers';
export { fetchSubscribeFormConfigFromNotion } from './notion';
export declare function createSubscribeFormConfig(options: CreateSubscribeFormConfigOptions): {
    getSubscribeFormConfig: () => Promise<SubscribeFormConfig>;
    getSubscribeFormConfigFresh: () => Promise<SubscribeFormConfig>;
    getSubscribeFormConfigResultFresh: () => Promise<SubscribeFormConfigResult>;
    getDefaultSubscribeFormConfig: () => SubscribeFormConfig;
    formConfigGetHandler: () => Promise<NextResponse<{
        config: SubscribeFormConfig;
        meta: {
            brandDomain: string;
            brandSlug: string;
            notionConfigured: boolean;
            hasToken: boolean;
            hasDb: boolean;
            usedFallback: boolean;
            issues: string[];
            hint: string;
        };
    }>>;
};
