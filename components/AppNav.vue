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

onMounted(() => {
  const onScroll = () => { isScrolled.value = window.scrollY > 50 }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>

<template>
  <nav
    class="nav"
    :class="{ 'nav--open': isMenuOpen, 'nav--scrolled': isScrolled }"
  >
    <div class="nav__container">
      <NuxtLink to="/" class="nav__logo" @click="closeMenu">
        {{ data?.siteName }}
      </NuxtLink>

      <button
        class="nav__hamburger"
        :aria-expanded="isMenuOpen"
        aria-label="Menu openen"
        @click="toggleMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul class="nav__links">
        <li v-for="item in data?.navigation" :key="item.href">
          <NuxtLink
            :to="item.href"
            :class="item.isButton ? 'btn btn-green' : ''"
            @click="closeMenu"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
