/**
 * v-reveal — subtiele scroll-reveal per sectie.
 * - respecteert prefers-reduced-motion (geen animatie)
 * - elementen die al in beeld staan bij mount animeren niet (geen flikker)
 * - optionele waarde = vertraging in ms: v-reveal="150"
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Observer per element, zodat hij bij unmount (bv. navigatie vóór het
  // element in beeld kwam) netjes wordt opgeruimd i.p.v. te blijven hangen
  const observers = new WeakMap<HTMLElement, IntersectionObserver>()

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({}),
    unmounted(el: HTMLElement) {
      observers.get(el)?.disconnect()
      observers.delete(el)
    },
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
              observers.delete(el)
            }
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
      )
      io.observe(el)
      observers.set(el, io)
    },
  })
})
