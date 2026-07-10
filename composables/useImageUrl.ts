import { createImageUrlBuilder } from '@sanity/image-url'
import { createClient } from '@sanity/client'
import type { SanityImageSource } from '@sanity/image-url'

let _builder: ReturnType<typeof createImageUrlBuilder> | null = null

export function useImageUrl() {
  if (!_builder) {
    const config = useRuntimeConfig()
    const client = createClient({
      projectId: config.public.sanity.projectId as string,
      dataset: config.public.sanity.dataset as string,
      apiVersion: '2024-01-01',
      useCdn: false,
    })
    _builder = createImageUrlBuilder(client)
  }
  // Proxy that swallows all chained calls and returns '' from .url()
  const PLACEHOLDER: any = new Proxy({}, {
    get(_, prop) {
      if (prop === 'url') return () => ''
      return () => PLACEHOLDER
    },
  })

  return (source: SanityImageSource | null | undefined) => {
    if (!source || !(source as any)?.asset?._ref) return PLACEHOLDER
    return _builder!.image(source)
  }
}
