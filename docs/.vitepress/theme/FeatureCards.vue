<script setup lang="ts">
const features = [
  {
    icon: '⚡',
    title: 'Ship in 60 Seconds',
    description:
      'Run one command and get a fully wired project — Dockerfile, CI/CD, and environment config already connected. No config files to touch.',
  },
  {
    icon: '🏗️',
    title: '6 Battle-Tested Templates',
    description:
      'web-app, api-service, ml-pipeline, next-app, go-api, and serverless — all run on first scaffold with tests, linting, and health checks included.',
  },
  {
    icon: '🔄',
    title: 'CI/CD from Day One',
    description:
      'GitHub Actions workflows are wired and green from your first commit. Matrix tested across Node 18 and 20 with smoke and integration tests on every PR.',
  },
  {
    icon: '🔒',
    title: 'Security by Default',
    description:
      'Path containment, input validation, CodeQL static analysis, Gitleaks secret scanning, and npm audit run automatically on every push.',
  },
  {
    icon: '🐳',
    title: 'Docker Ready',
    description:
      'Every template ships a production-grade Dockerfile and docker-compose.yml. Run your full stack locally or deploy to any container platform.',
  },
  {
    icon: '📊',
    title: 'Live Test Coverage',
    description:
      'Jest + Istanbul track line, statement, branch, and function coverage on every push. Metrics are published to the coverage dashboard after every CI run.',
  },
]
</script>

<template>
  <div class="fk-feature-cards fk-grid" role="list">
    <div
      v-for="feature in features"
      :key="feature.title"
      class="fk-card fk-feature-card"
      role="listitem"
    >
      <div class="fk-feature-icon" aria-hidden="true">{{ feature.icon }}</div>
      <h3 class="fk-feature-title">{{ feature.title }}</h3>
      <p class="fk-feature-desc">{{ feature.description }}</p>
    </div>
  </div>
</template>
