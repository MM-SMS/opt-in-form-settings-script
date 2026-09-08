import type { SubscribeFormConfig } from './types';
/**
 * Wide Notion table (one row per brand).
 * Brand = real domain (`lavessia.org`); code matches via `lavessia_org`.
 * `{field}_visible` checkbox = show/hide. `{field}` text = label/copy (empty → code default).
 * Notion API / SDK v5+: query via `dataSources.query`.
 */
export declare function fetchSubscribeFormConfigFromNotion(options: {
    token: string;
    databaseId: string;
    brandSlug: string;
    base: SubscribeFormConfig;
}): Promise<SubscribeFormConfig>;
