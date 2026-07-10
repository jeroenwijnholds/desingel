<script setup lang="ts">
const QUERY = `*[_type == "siteSettings"][0]{ siteName, navigation }`

interface NavItem { label: string; href: string; isButton: boolean }
interface SiteSettings { siteName: string; navigation: NavItem[] }

const { data } = useSanityQuery<SiteSettings>(QUERY)

const route = useRoute()
const isHome = computed(() => route.path === '/')

const isMenuOpen = ref(false)
const isScrolled = ref(false)
const navEl = ref<HTMLElement | null>(null)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

function closeMenu() {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

// Menu sluit bij elke navigatie (vangt ook browser-terugknop)
watch(() => route.path, closeMenu)

function onKeydown(e: KeyboardEvent) {
  if (!isMenuOpen.value) return
  if (e.key === 'Escape') {
    closeMenu()
    return
  }
  if (e.key === 'Tab') {
    // Focus-trap binnen de nav zolang het menu open is
    const focusables = navEl.value?.querySelectorAll<HTMLElement>('a, button') ?? []
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

const onScroll = () => {
  const hero = document.querySelector('.hero')
  if (hero) {
    const heroRect = hero.getBoundingClientRect()
    const clipOffset = window.innerWidth >= 768 ? heroRect.height * 0.07 : 0
    isScrolled.value = (heroRect.bottom - clipOffset) <= 0
  } else {
    isScrolled.value = window.scrollY > 0
  }
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <nav
    ref="navEl"
    class="nav"
    :class="{ 'nav--open': isMenuOpen, 'nav--scrolled': isScrolled || !isHome }"
  >
    <NuxtLink to="/" class="nav-logo" @click="closeMenu">
      Belevenisboerderij<br>de Singel
    </NuxtLink>

    <button
      class="nav-hamburger"
      :aria-expanded="isMenuOpen.toString()"
      :aria-label="isMenuOpen ? 'Menu sluiten' : 'Menu openen'"
      @click="toggleMenu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div class="nav-menu">
      <ul class="nav-links">
        <li
          v-for="item in (data?.navigation ?? []).filter((n: NavItem) => !n.isButton)"
          :key="item.href"
        >
          <NuxtLink :to="item.href" @click="closeMenu">{{ item.label }}</NuxtLink>
        </li>
      </ul>
      <NuxtLink
        v-for="item in (data?.navigation ?? []).filter((n: NavItem) => n.isButton)"
        :key="item.href"
        :to="item.href"
        class="btn btn-green"
        @click="closeMenu"
      >
        {{ item.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
