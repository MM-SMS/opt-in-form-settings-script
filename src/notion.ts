import { Client } from '@notionhq/client'
import type { SubscribeFormConfig, SubscribeFormFieldKey } from './types'
import { SUBSCRIBE_FORM_FIELD_KEYS } from './types'
import {
  domainToBrandSlug,
  mergeSubscribeFormConfig,
  requiredColumnName,
  visibleColumnName,
} from './helpers'

type NotionRichText = Array<{ plain_text?: string }>

function richTextToPlain(rich: NotionRichText | undefined): string {
  if (!rich?.length) return ''
  return rich.map((t) => t.plain_text ?? '').join('').trim()
}

function readSelectName(prop: unknown): string {
  if (!prop || typeof prop !== 'object') return ''
  const p = prop as { type?: string; select?: { name?: string } | null; title?: NotionRichText }
  if (p.type === 'select') return p.select?.name?.trim() ?? ''
  if (p.type === 'title') return richTextToPlain(p.title)
  return ''
}

function readText(prop: unknown): string {
  if (!prop || typeof prop !== 'object') return ''
  const p = prop as {
    type?: string
    rich_text?: NotionRichText
    title?: NotionRichText
  }
  if (p.type === 'rich_text') return richTextToPlain(p.rich_text)
  if (p.type === 'title') return richTextToPlain(p.title)
  return ''
}

function readCheckbox(prop: unknown): boolean | null {
  if (!prop || typeof prop !== 'object') return null
  const p = prop as { type?: string; checkbox?: boolean }
  if (p.type === 'checkbox') return Boolean(p.checkbox)
  return null
}

async function resolveDataSourceId(notion: Client, databaseId: string): Promise<string> {
  const db = await notion.databases.retrieve({ database_id: databaseId })
  const sources = (db as { data_sources?: Array<{ id?: string }> }).data_sources
  const id = sources?.[0]?.id
  if (!id) {
    throw new Error(
      `Notion database ${databaseId} has no data_sources — cannot query rows with @notionhq/client v5+`,
    )
  }
  return id
}

/**
 * Wide Notion table (one row per brand).
 * Brand = real domain (`lavessia.org`); code matches via `lavessia_org`.
 * `{field}_visible` checkbox = show/hide.
 * `{field}_required` checkbox = required when visible.
 * `{field}` text = label/copy (empty → code default).
 * Notion API / SDK v5+: query via `dataSources.query`.
 */
export async function fetchSubscribeFormConfigFromNotion(options: {
  token: string
  databaseId: string
  brandSlug: string
  base: SubscribeFormConfig
}): Promise<SubscribeFormConfig> {
  const notion = new Client({ auth: options.token })
  const dataSourceId = await resolveDataSourceId(notion, options.databaseId)

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    page_size: 100,
  })

  const target = domainToBrandSlug(options.brandSlug)
  const page = response.results.find((row) => {
    if (!('properties' in row)) return false
    const brand = readSelectName(row.properties.Brand)
    return domainToBrandSlug(brand) === target
  })

  if (!page || !('properties' in page)) {
    console.warn(
      `[subscribe-form-config] No Notion row for brand "${options.brandSlug}" — using defaults`,
    )
    return options.base
  }

  const props = page.properties
  const overrides: Partial<
    Record<SubscribeFormFieldKey, Partial<{ visible: boolean; required: boolean; text: string }>>
  > = {}

  for (const key of SUBSCRIBE_FORM_FIELD_KEYS) {
    const visibleCol = visibleColumnName(key)
    const requiredCol = requiredColumnName(key)
    const hasVisibleCol = props[visibleCol] !== undefined
    const hasRequiredCol = props[requiredCol] !== undefined
    const hasTextCol = props[key] !== undefined

    if (!hasVisibleCol && !hasRequiredCol && !hasTextCol) continue

    const visible = hasVisibleCol ? readCheckbox(props[visibleCol]) : null
    const required = hasRequiredCol ? readCheckbox(props[requiredCol]) : null
    const text = hasTextCol ? readText(props[key]) : ''

    overrides[key] = {
      ...(visible === null ? {} : { visible }),
      ...(required === null ? {} : { required }),
      ...(text ? { text } : {}),
    }
  }

  return mergeSubscribeFormConfig(options.base, overrides)
}
