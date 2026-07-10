/**
 * v-reveal — subtiele scroll-reveal per sectie.
 * - respecteert prefers-reduced-motion (geen animatie)
 * - elementen die al in beeld staan bij mount animeren niet (geen flikker)
 * - optionele waarde = vertraging in ms: v-reveal="150"
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({}),
    mounted(el: HTMLElement, binding: { value?: number }) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      // Al zichtbaar bij laden → niet verstoppen
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) return

      el.classList.add('reveal')
      if (binding.value) el.style.transitionDelay = `${binding.value}ms`

      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              el.classList.add('reveal--visible')
              io.disconnect()
            }
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
      )
      io.observe(el)
    },
  })
})
