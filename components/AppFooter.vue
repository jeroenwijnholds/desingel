<script setup lang="ts">
const QUERY = `*[_type == "siteSettings"][0]{ siteName, tagline, footerCopyright, navigation, owners, address }`

interface NavItem { label: string; href: string; isButton: boolean }
interface Owner { name: string; role: string }
interface SiteSettings {
  siteName: string
  tagline: string
  footerCopyright: string
  navigation: NavItem[]
  owners: Owner[]
  address: string
}

const { data } = await useSanityQuery<SiteSettings>(QUERY)

const navLinks = computed(() => (data.value?.navigation ?? []).filter(n => !n.isButton))
</script>

<template>
  <footer class="footer">
    <div class="footer-wrapper">
      <div class="footer-col footer-col--brand">
        <p class="footer-name">{{ data?.siteName }}</p>
        <p class="footer-tagline">{{ data?.tagline }}</p>
      </div>

      <div class="footer-col footer-col--nav">
        <p class="footer-heading">Navigatie</p>
        <ul class="footer-links">
          <li v-for="item in navLinks" :key="item.href">
            <NuxtLink :to="item.href">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="footer-col footer-col--contact">
        <p class="footer-heading">Contact</p>
        <p v-for="owner in data?.owners" :key="owner.name">{{ owner.name }}</p>
        <p v-if="data?.address" style="white-space: pre-line">{{ data.address }}</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>{{ data?.footerCopyright }}</p>
    </div>
  </footer>
</template>
