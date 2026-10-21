import type { PortableTextVueComponents } from '@portabletext/vue'
import { defineComponent, h, type FunctionalComponent, type PropType } from 'vue'
import { NuxtLink } from '#components'

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
      value: { type: Object as PropType<SanityImageField | null>, default: null },
      index: { type: Number, default: 0 },
      isInline: { type: Boolean, default: false },
      renderNode: { type: Function as PropType<(...args: unknown[]) => unknown>, default: undefined },
    },
    setup(props) {
      return () => {
        const val = props.value
        if (!hasImage(val)) return null
        return h('figure', { class: 'prose-figure' }, [
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

  // De Studio-stijl "Citaat" kwam als kale <blockquote> zonder styling
  // binnen; de citaatstijl was nergens aan gekoppeld (stijl: .prose-quote
  // in components.css).
  const Blockquote: FunctionalComponent = (_, { slots }) =>
    h('blockquote', { class: 'prose-quote' }, slots.default?.())

  // Links: interne paden via NuxtLink, anders kloppen ze niet onder het
  // /desingel/-subpad van GitHub Pages; externe links in een nieuw tabblad.
  const Link: FunctionalComponent<{ value?: { href?: string } }> = (props, { slots }) => {
    const href = props.value?.href?.trim() ?? ''
    if (href.startsWith('/')) return h(NuxtLink, { to: href }, slots.default)
    return h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, slots.default?.())
  }

  return {
    types: { image: PortableTextImage },
    block: { blockquote: Blockquote },
    marks: { link: Link },
  } as Partial<PortableTextVueComponents>
}
