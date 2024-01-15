import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'The AOI Project',
  description: 'The ultimate online judge solution',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [{ text: 'Getting Started', link: '/getting-started' }]
      },
      {
        text: 'Guides',
        items: [
          { text: 'Admin Guide', link: '/admin-guide' },
          { text: 'Dev Guide', link: '/dev-guide' }
        ]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/fedstackjs/aoi' }]
  }
})
