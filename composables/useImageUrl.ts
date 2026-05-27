import imageUrlBuilder from '@sanity/image-url'
import { createClient } from '@sanity/client'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

let _builder: ReturnType<typeof imageUrlBuilder> | null = null

export function useImageUrl() {
  if (!_builder) {
    const config = useRuntimeConfig()
    const client = createClient({
      projectId: config.public.sanity.projectId as string,
      dataset: config.public.sanity.dataset as string,
      apiVersion: '2024-01-01',
      useCdn: false,
    })
    _builder = imageUrlBuilder(client)
  }
  return (source: SanityImageSource) => _builder!.image(source)
}
