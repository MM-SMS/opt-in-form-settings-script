export declare const SUBSCRIBE_FORM_FIELD_KEYS: readonly ["firstName", "lastName", "email", "phone", "cbEmail", "cbSms", "cbMarketing", "cbTerms"];
export type SubscribeFormFieldKey = (typeof SUBSCRIBE_FORM_FIELD_KEYS)[number];
export interface SubscribeFormFieldConfig {
    /** When false, the field is not rendered. Submit still sends '' / false. */
    visible: boolean;
    /** Input label or checkbox body text. */
    text: string;
}
export type SubscribeFormConfig = Record<SubscribeFormFieldKey, SubscribeFormFieldConfig>;
export type SubscribeFormDefaultTexts = Partial<Record<SubscribeFormFieldKey, string>>;
export interface SubscribeFormBrand {
    /** Public brand name, e.g. Lavessia */
    name: string;
    /** Real domain with dots, e.g. lavessia.org */
    domain: string;
    /** Legal entity, e.g. LAVESSIA LLC */
    legalEntity: string;
}
export interface SubscribeFormConfigContext {
    /** From `brand.domain` via `domainToBrandSlug` (`lavessia.org` → `lavessia_org`). */
    brandSlug: string;
    brandName: string;
    legalEntity: string;
}
export interface SubscribeFormConfigResult {
    config: SubscribeFormConfig;
    usedFallback: boolean;
    issues: string[];
    notionConfigured: boolean;
}
export interface CreateSubscribeFormConfigOptions {
    getBrand: () => SubscribeFormBrand;
    /** Optional copy overrides for built-in defaults (consent texts, labels). */
    getDefaultTexts?: (brand: SubscribeFormBrand) => SubscribeFormDefaultTexts;
    env?: {
        token?: string;
        databaseId?: string;
    };
}
