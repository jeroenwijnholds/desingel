<script setup lang="ts">
const QUERY = `*[_type == "siteSettings"][0]{ siteName, navigation }`

interface NavItem { label: string; href: string; isButton: boolean }
interface SiteSettings { siteName: string; navigation: NavItem[] }

const { data } = await useSanityQuery<SiteSettings>(QUERY)

const isMenuOpen = ref(false)
const isScrolled = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

function closeMenu() {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

const onScroll = () => { isScrolled.value = window.scrollY > 50 }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <nav
    class="nav"
    :class="{ 'nav--open': isMenuOpen, 'nav--scrolled': isScrolled }"
  >
    <NuxtLink to="/" class="nav-logo" @click="closeMenu">
      Belevenisboerderij<br>de Singel
    </NuxtLink>

    <button
      class="nav-hamburger"
      :aria-expanded="isMenuOpen.toString()"
      aria-label="Menu openen"
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
