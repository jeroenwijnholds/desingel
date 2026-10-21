/**
 * Gedeelde dialoog-hulpjes voor het mobiele menu (AppNav) en de lightbox
 * (AppLightbox); stonden in beide componenten gekopieerd.
 */

/**
 * Houdt Tab/Shift+Tab binnen `container`: van het laatste naar het eerste
 * focusbare element en andersom. Aanroepen vanuit een keydown-handler.
 */
export function trapFocus(e: KeyboardEvent, container: HTMLElement | null | undefined, selector = 'a[href], button:not([disabled])') {
  if (e.key !== 'Tab' || !container) return
  const focusables = container.querySelectorAll<HTMLElement>(selector)
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (!first || !last) return
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

// Aantal openstaande locks over alle componenten heen: pas als de laatste
// dialoog sluit mag de pagina weer scrollen
let activeLocks = 0

/** Blokkeert het scrollen van de pagina zolang er een dialoog open is */
export function useScrollLock() {
  let held = false
  const lock = () => {
    if (held) return
    held = true
    if (activeLocks++ === 0) document.body.style.overflow = 'hidden'
  }
  const unlock = () => {
    if (!held) return
    held = false
    if (--activeLocks === 0) document.body.style.overflow = ''
  }
  onUnmounted(unlock)
  return { lock, unlock }
}
