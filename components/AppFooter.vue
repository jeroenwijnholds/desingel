<script setup lang="ts">
const QUERY = `*[_type == "siteSettings"][0]{ siteName, footerCopyright, navigation }`

interface NavItem { label: string; href: string; isButton: boolean }
interface SiteSettings { siteName: string; footerCopyright: string; navigation: NavItem[] }

const { data } = await useSanityQuery<SiteSettings>(QUERY)
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <NuxtLink to="/" class="footer__logo">
        {{ data?.siteName }}
      </NuxtLink>

      <nav class="footer__nav" aria-label="Footer navigatie">
        <ul>
          <li v-for="item in (data?.navigation ?? []).filter((n: NavItem) => !n.isButton)" :key="item.href">
            <NuxtLink :to="item.href">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <p class="footer__copyright">{{ data?.footerCopyright }}</p>
    </div>
  </footer>
</template>
