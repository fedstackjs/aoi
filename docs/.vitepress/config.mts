import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'The AOI Project',
  description: '终极在线评测解决方案',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '开始使用', link: '/getting-started' }
    ],

    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '开始使用', link: '/getting-started' },
          { text: '基本概念', link: '/basic-concepts' }
        ]
      },
      {
        text: '教程',
        items: [
          { text: '使用指南', link: '/user-guide' },
          { text: '管理指南', link: '/admin-guide' },
          { text: '开发指南', link: '/dev-guide' }
        ]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/fedstackjs/aoi' }],

    editLink: {
      pattern: 'https://github.com/fedstackjs/aoi/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the AGPL-3.0 License.',
      copyright: 'Copyright © 2022-present FedStack'
    }
  },
  locales: {
    root: {
      label: '中文',
      lang: 'zh'
    },
    en: {
      label: 'English',
      lang: 'en',
      title: 'The AOI Project',
      description: 'The ultimate online judge solution',
      themeConfig: {
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
        ]
      }
    }
  }
})
