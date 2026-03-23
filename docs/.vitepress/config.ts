import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'

export default withPwa(defineConfig({
  title: 'ForgeKit',
  description: 'Engineering acceleration for AI, DevOps, and full-stack teams',
  base: '/',

  appearance: 'dark',

  lastUpdated: true,

  // /coverage-report/ is populated after build (lcov HTML copied into dist)
  ignoreDeadLinks: [
    /^\/coverage-report/,
  ],

  vite: {},

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Templates', link: '/templates/' },
      { text: 'CLI Reference', link: '/cli-reference' },
      { text: 'Coverage', link: '/coverage' },
      { text: 'Security', link: '/security' },
      { text: 'Contributing', link: '/contributing' },
      { text: 'FAQ', link: '/faq' },
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
        text: 'Quality & Security',
        items: [
          { text: 'Test Coverage', link: '/coverage' },
          { text: 'Security Pipeline', link: '/security' },
        ],
      },
      {
        text: 'Contributing',
        items: [
          { text: 'Guide', link: '/contributing' },
        ],
      },
      {
        text: 'Help',
        items: [
          { text: 'Troubleshooting', link: '/troubleshooting' },
          { text: 'FAQ', link: '/faq' },
        ],
      },
      {
        text: 'Community',
        items: [
          { text: 'vs. Alternatives', link: '/comparison' },
          { text: 'Showcase', link: '/showcase' },
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
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/icon-192.png' }],
    ['meta', { name: 'theme-color', content: '#00d4ff' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'ForgeKit' }],
    ['meta', { property: 'og:description', content: 'Engineering acceleration for AI, DevOps, and full-stack teams' }],
    ['meta', { property: 'og:image', content: 'https://forgekit.build/social-preview.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: 'https://forgekit.build/social-preview.png' }],
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'ForgeKit',
      short_name: 'ForgeKit',
      description: 'Engineering acceleration for AI, DevOps, and full-stack teams',
      theme_color: '#00d4ff',
      background_color: '#0a0a0a',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/logo.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{css,js,html,svg,png,ico,woff2}'],
    },
  },
}))
