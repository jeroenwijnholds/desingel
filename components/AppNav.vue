<script setup lang="ts">
const { data } = useSiteSettings()

const route = useRoute()
const isHome = computed(() => route.path === '/')

const isMenuOpen = ref(false)
const isScrolled = ref(false)
const navEl = ref<HTMLElement | null>(null)
const scroll = useScrollLock()

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) scroll.lock()
  else scroll.unlock()
}

function closeMenu() {
  isMenuOpen.value = false
  scroll.unlock()
}

// Menu sluit bij elke navigatie (vangt ook browser-terugknop)
watch(() => route.path, closeMenu)

function onKeydown(e: KeyboardEvent) {
  if (!isMenuOpen.value) return
  if (e.key === 'Escape') {
    closeMenu()
    return
  }
  // Focus blijft binnen de nav zolang het menu open is
  trapFocus(e, navEl.value)
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
})
</script>

<template>
  <nav
    ref="navEl"
    class="nav"
    aria-label="Hoofdmenu"
    :class="{ 'nav--open': isMenuOpen, 'nav--scrolled': isScrolled || !isHome }"
  >
    <NuxtLink to="/" class="nav-logo" @click="closeMenu">
      {{ data?.siteName ?? 'Belevenisboerderij de Singel' }}
    </NuxtLink>

    <button
      class="nav-hamburger"
      :aria-expanded="isMenuOpen"
      aria-controls="hoofdmenu"
      :aria-label="isMenuOpen ? 'Menu sluiten' : 'Menu openen'"
      @click="toggleMenu"
    >
      <span/>
      <span/>
      <span/>
    </button>

    <div id="hoofdmenu" class="nav-menu">
      <ul class="nav-links">
        <li
          v-for="item in (data?.navigation ?? []).filter(n => !n.isButton)"
          :key="item.href"
        >
          <NuxtLink :to="item.href" @click="closeMenu">{{ item.label }}</NuxtLink>
        </li>
      </ul>
      <NuxtLink
        v-for="item in (data?.navigation ?? []).filter(n => n.isButton)"
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
