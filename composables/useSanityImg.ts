interface SanityImgOptions {
  /** Breedtes voor de srcset, oplopend */
  widths: number[]
  /** sizes-attribuut, bv. '(max-width: 767px) 100vw, 33vw' */
  sizes: string
  /** breedte/hoogte-verhouding (b/h); indien gezet wordt de afbeelding
      op die verhouding bijgesneden en krijgt het element width/height */
  aspect?: number
}

/**
 * Levert alle attributen voor een responsive Sanity-afbeelding:
 * src, srcset, sizes en (bij vaste verhouding) width/height tegen
 * layout shift. WebP/AVIF via auto=format.
 *
 * Hotspot: bij `aspect` snijdt Sanity server-side al rond de hotspot.
 * Zonder `aspect` wordt de hotspot doorgegeven als inline
 * `object-position`, zodat CSS-crops (object-fit: cover) het door de
 * redactie gekozen beeldmiddelpunt volgen in plaats van hardcoded
 * percentages. Zonder hotspot blijft de CSS-fallback gelden.
 *
 * Gebruik in templates met v-bind: `<img v-bind="img(source, opts)" alt="…">`
 */
export function useSanityImg() {
  const imageUrl = useImageUrl()

  return (source: unknown, opts: SanityImgOptions) => {
    const build = (w: number) => {
      let b = imageUrl(source as any).width(w).auto('format').quality(75)
      if (opts.aspect) b = b.height(Math.round(w / opts.aspect))
      return b.url()
    }
    const maxW = Math.max(...opts.widths)
    const hotspot = (source as any)?.hotspot
    const objectPosition = !opts.aspect && hotspot
      ? `${(hotspot.x * 100).toFixed(1)}% ${(hotspot.y * 100).toFixed(1)}%`
      : undefined
    return {
      src: build(maxW),
      srcset: opts.widths.map(w => `${build(w)} ${w}w`).join(', '),
      sizes: opts.sizes,
      width: maxW,
      height: opts.aspect ? Math.round(maxW / opts.aspect) : undefined,
      ...(objectPosition ? { style: { objectPosition } } : {}),
    }
  }
}
