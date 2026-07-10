import type { PortableTextVueComponents } from '@portabletext/vue'
import { defineComponent, h, type PropType } from 'vue'

/**
 * Gedeelde PortableText-componenten voor artikel- en evenement-body's
 * (stond voorheen byte-voor-byte gedupliceerd in beide [slug]-pagina's).
 * Afbeeldingen renderen als <figure> met responsive srcset en optioneel
 * bijschrift; alt komt uit het CMS-veld.
 */
export function usePortableTextComponents(): Partial<PortableTextVueComponents> {
  const img = useSanityImg()

  const PortableTextImage = defineComponent({
    props: {
      value: { type: Object as PropType<Record<string, any> | null>, default: null },
      index: { type: Number, default: 0 },
      isInline: { type: Boolean, default: false },
      renderNode: { type: Function as PropType<(...args: any[]) => any>, default: undefined },
    },
    setup(props) {
      return () => {
        const val = props.value
        if (!val) return null
        return h('figure', { class: 'article-figure' }, [
          h('img', {
            ...img(val, { widths: [500, 900, 1400], sizes: '(max-width: 900px) 100vw, 800px' }),
            alt: val.alt ?? '',
            loading: 'lazy',
          }),
          val.caption ? h('figcaption', val.caption) : null,
        ].filter(Boolean))
      }
    },
  })

  return {
    types: { image: PortableTextImage },
  } as Partial<PortableTextVueComponents>
}
