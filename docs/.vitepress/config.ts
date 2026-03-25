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
      { text: 'GitHub Action', link: '/github-action' },
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
          { text: 'Next App', link: '/templates/next-app' },
          { text: 'Go API', link: '/templates/go-api' },
          { text: 'Serverless', link: '/templates/serverless' },
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
        text: 'Features',
        items: [
          { text: 'AI Scaffolding', link: '/features/ai-scaffolding' },
          { text: 'Health Score', link: '/features/health-score' },
          { text: 'Dependency Audit', link: '/features/dependency-audit' },
          { text: 'Deploy', link: '/features/deploy' },
          { text: 'Env Sync', link: '/features/env-sync' },
          { text: 'Docs Generation', link: '/features/docs-generation' },
          { text: 'Plugin System', link: '/features/plugin-system' },
          { text: 'Template Marketplace', link: '/features/template-marketplace' },
        ],
      },
      {
        text: 'Integrations',
        items: [
          { text: 'GitHub Action', link: '/github-action' },
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
      { icon: 'x', link: 'https://x.com/forgekit_os' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/company/forgekit-build' },
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
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-N7VT58473J' }],
    ['script', {}, "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-N7VT58473J');"],
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
    ['meta', { name: 'twitter:site', content: '@forgekit_os' }],
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
      navigateFallbackDenylist: [/^\/coverage-report/, /^\/coverage\.html/, /^\/coverage\//],
      skipWaiting: true,
      clientsClaim: true,
    },
  },
}))
