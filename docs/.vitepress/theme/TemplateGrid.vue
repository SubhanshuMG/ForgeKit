<script setup lang="ts">
const templates = [
  {
    name: 'web-app',
    stack: 'TypeScript',
    badgeClass: 'fk-badge fk-badge-ts',
    description: 'Full-stack React + Express application with Vite. One repo, one deploy.',
    link: '/templates/web-app',
  },
  {
    name: 'api-service',
    stack: 'Python',
    badgeClass: 'fk-badge fk-badge-python',
    description: 'Production REST API with FastAPI, PostgreSQL, SQLAlchemy 2.0, and Alembic migrations.',
    link: '/templates/api-service',
  },
  {
    name: 'ml-pipeline',
    stack: 'Python',
    badgeClass: 'fk-badge fk-badge-python',
    description: 'Reproducible ML workflow with MLflow tracking, Jupyter Lab, and a structured source layout.',
    link: '/templates/ml-pipeline',
  },
  {
    name: 'next-app',
    stack: 'TypeScript',
    badgeClass: 'fk-badge fk-badge-ts',
    description: 'Next.js App Router with Tailwind CSS, TypeScript, and Docker support out of the box.',
    link: '/templates/next-app',
  },
  {
    name: 'go-api',
    stack: 'Go',
    badgeClass: 'fk-badge fk-badge-go',
    description: 'High-performance REST API built with Go and the Gin framework, wired with PostgreSQL.',
    link: '/templates/go-api',
  },
  {
    name: 'serverless',
    stack: 'AWS',
    badgeClass: 'fk-badge fk-badge-aws',
    description: 'TypeScript Lambda functions managed with the Serverless Framework. Deploy without managing servers.',
    link: '/templates/serverless',
  },
]
</script>

<template>
  <div class="fk-template-grid fk-grid" role="list">
    <div
      v-for="tpl in templates"
      :key="tpl.name"
      class="fk-card fk-template-card"
      role="listitem"
    >
      <div class="fk-template-header">
        <code class="fk-template-name">{{ tpl.name }}</code>
        <span :class="tpl.badgeClass">{{ tpl.stack }}</span>
      </div>
      <p class="fk-template-desc">{{ tpl.description }}</p>
      <a :href="tpl.link" class="fk-template-link" :aria-label="`View docs for ${tpl.name}`">View docs →</a>
    </div>
  </div>
</template>
