import { createImageUrlBuilder } from '@sanity/image-url'
import type { ImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageAssetReference, SanityImageCrop, SanityImageHotspot } from '~/types/sanity.types'

/** Elk afbeeldingsveld uit het schema (imageField/imageArrayMember): asset + hotspot + alt */
export interface SanityImageField {
  _type?: 'image'
  asset?: SanityImageAssetReference
  hotspot?: SanityImageHotspot
  crop?: SanityImageCrop
  alt?: string
  caption?: string
}

let _builder: ReturnType<typeof createImageUrlBuilder> | null = null

/**
 * Heeft deze Sanity-afbeelding echt een bestand? Gebruik dit in v-if's in
 * plaats van een truthy-check: het alt-veld zit ín het image-object, dus
 * een redacteur kan `{ alt: '…' }` opslaan zonder foto. Een truthy-check
 * slaagt dan en de pagina rendert een <img src=""> met kapotte srcset.
 */
export function hasImage<T extends SanityImageField | null | undefined>(source: T): source is NonNullable<T> & { asset: SanityImageAssetReference } {
  return !!source?.asset?._ref
}

export function useImageUrl() {
  if (!_builder) {
    // De image-builder heeft alleen project en dataset nodig, geen client
    const config = useRuntimeConfig()
    _builder = createImageUrlBuilder({
      projectId: config.public.sanity.projectId as string,
      dataset: config.public.sanity.dataset as string,
    })
  }
  // Proxy that swallows all chained calls and returns '' from .url()
  const PLACEHOLDER = new Proxy({}, {
    get(_, prop) {
      if (prop === 'url') return () => ''
      return () => PLACEHOLDER
    },
  }) as unknown as ImageUrlBuilder

  return (source: SanityImageField | null | undefined): ImageUrlBuilder => {
    if (!hasImage(source)) return PLACEHOLDER
    return _builder!.image(source)
  }
}
