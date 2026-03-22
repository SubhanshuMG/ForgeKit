import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ForgeKit',
  description: 'Engineering acceleration for AI, DevOps, and full-stack teams',
  base: '/',

  appearance: 'dark',

  lastUpdated: true,

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Templates', link: '/templates/' },
      { text: 'CLI Reference', link: '/cli-reference' },
      { text: 'Contributing', link: '/contributing' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Quick Start', link: '/getting-started' },
          { text: 'Installation', link: '/installation' },
        ],
      },
      {
        text: 'Templates',
        items: [
          { text: 'Overview', link: '/templates/' },
          { text: 'Web App', link: '/templates/web-app' },
          { text: 'API Service', link: '/templates/api-service' },
          { text: 'ML Pipeline', link: '/templates/ml-pipeline' },
        ],
      },
      {
        text: 'CLI Reference',
        items: [
          { text: 'Commands', link: '/cli-reference' },
          { text: 'Configuration', link: '/configuration' },
        ],
      },
      {
        text: 'Contributing',
        items: [
          { text: 'Guide', link: '/contributing' },
          { text: 'Security', link: '/security' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SubhanshuMG/ForgeKit' },
    ],

    editLink: {
      pattern: 'https://github.com/SubhanshuMG/ForgeKit/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the Apache 2.0 License.',
      copyright: 'Copyright 2026 ForgeKit Contributors',
    },
  },

  head: [
    ['meta', { name: 'theme-color', content: '#00d4ff' }],
  ],
})
