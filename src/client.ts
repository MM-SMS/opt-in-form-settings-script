'use client'

import { useEffect, useState } from 'react'
import type { SubscribeFormConfig } from './types'

export type { SubscribeFormConfig, SubscribeFormFieldKey } from './types'
export { SUBSCRIBE_FORM_FIELD_KEYS } from './types'
export {
  isSubscribeFieldVisible,
  isSubscribeFieldRequired,
  subscribeFieldText,
  subscribeFieldLabel,
  mergeSubscribeFormConfig,
  isSubscribeFormFieldKey,
  normalizeBrandDomain,
  domainToBrandSlug,
  getSubscribeFormConfigIssues,
  isSubscribeFormConfigCoherent,
} from './helpers'

/**
 * Client helper when config was not passed from a Server Component.
 * Prefers `/api/subscription/form-config`, falls back to `initial` or `fallback`.
 */
export function useSubscribeFormConfig(
  initial?: SubscribeFormConfig,
  fallback?: SubscribeFormConfig,
) {
  const [config, setConfig] = useState<SubscribeFormConfig | undefined>(
    () => initial ?? fallback,
  )

  useEffect(() => {
    if (initial) {
      setConfig(initial)
      return
    }

    let cancelled = false
    fetch('/api/subscription/form-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.config) setConfig(data.config as SubscribeFormConfig)
      })
      .catch(() => {
        /* keep fallback */
      })

    return () => {
      cancelled = true
    }
  }, [initial])

  return config
}
