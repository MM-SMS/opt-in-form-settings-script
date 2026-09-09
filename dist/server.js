import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import { buildDefaultSubscribeFormConfig } from './defaults';
import { domainToBrandSlug, resolveSubscribeFormConfig } from './helpers';
import { fetchSubscribeFormConfigFromNotion } from './notion';
export { SUBSCRIBE_FORM_FIELD_KEYS } from './types';
export { buildDefaultSubscribeFormConfig, genericConsentCopy } from './defaults';
export { isSubscribeFieldVisible, isSubscribeFieldRequired, subscribeFieldText, subscribeFieldLabel, mergeSubscribeFormConfig, isSubscribeFormFieldKey, normalizeBrandDomain, domainToBrandSlug, visibleColumnName, requiredColumnName, getSubscribeFormConfigIssues, isSubscribeFormConfigCoherent, resolveSubscribeFormConfig, } from './helpers';
export { fetchSubscribeFormConfigFromNotion } from './notion';
function readEnv(options) {
    return {
        token: options?.token || process.env.NOTION_TOKEN,
        databaseId: options?.databaseId || process.env.NOTION_SUBSCRIBE_FORM_DB_ID,
    };
}
function toContext(brand) {
    return {
        brandSlug: domainToBrandSlug(brand.domain),
        brandName: brand.name,
        legalEntity: brand.legalEntity,
    };
}
export function createSubscribeFormConfig(options) {
    function defaultsFor(brand) {
        return buildDefaultSubscribeFormConfig(brand, options.getDefaultTexts?.(brand));
    }
    async function loadResult() {
        const brand = options.getBrand();
        const ctx = toContext(brand);
        const defaults = defaultsFor(brand);
        const { token, databaseId } = readEnv(options.env);
        const notionConfigured = Boolean(token && databaseId);
        if (!token || !databaseId) {
            return { config: defaults, usedFallback: false, issues: [], notionConfigured: false };
        }
        try {
            const fromNotion = await fetchSubscribeFormConfigFromNotion({
                token,
                databaseId,
                brandSlug: ctx.brandSlug,
                base: defaults,
            });
            const resolved = resolveSubscribeFormConfig(fromNotion, defaults);
            return { ...resolved, notionConfigured: true };
        }
        catch (err) {
            console.error('[subscribe-form-config] Notion fetch failed — using defaults', err);
            return {
                config: defaults,
                usedFallback: true,
                issues: ['Notion fetch failed'],
                notionConfigured: true,
            };
        }
    }
    async function getSubscribeFormConfigResultFresh() {
        return loadResult();
    }
    async function getSubscribeFormConfigFresh() {
        return (await loadResult()).config;
    }
    async function getSubscribeFormConfig() {
        const brand = options.getBrand();
        const slug = domainToBrandSlug(brand.domain);
        const cached = unstable_cache(() => getSubscribeFormConfigFresh(), ['subscribe-form-config', slug, 'pkg-v2-required'], { revalidate: 120 });
        return cached();
    }
    function getDefaultSubscribeFormConfig() {
        return defaultsFor(options.getBrand());
    }
    async function formConfigGetHandler() {
        const brand = options.getBrand();
        const { token, databaseId } = readEnv(options.env);
        const hasToken = Boolean(token);
        const hasDb = Boolean(databaseId);
        const brandSlug = domainToBrandSlug(brand.domain);
        const result = await getSubscribeFormConfigResultFresh();
        return NextResponse.json({
            config: result.config,
            meta: {
                brandDomain: brand.domain,
                brandSlug,
                notionConfigured: hasToken && hasDb,
                hasToken,
                hasDb,
                usedFallback: result.usedFallback,
                issues: result.issues,
                hint: !hasToken || !hasDb
                    ? 'Set NOTION_TOKEN and NOTION_SUBSCRIBE_FORM_DB_ID, then redeploy/restart.'
                    : result.usedFallback
                        ? 'Notion row failed coherence checks — serving default full form. Fix visibility pairs in meta.issues.'
                        : `Notion Brand should be "${brand.domain}" (matched as ${brandSlug}).`,
            },
        });
    }
    return {
        getSubscribeFormConfig,
        getSubscribeFormConfigFresh,
        getSubscribeFormConfigResultFresh,
        getDefaultSubscribeFormConfig,
        formConfigGetHandler,
    };
}
