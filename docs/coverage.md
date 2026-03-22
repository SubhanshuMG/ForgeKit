---
title: Test Coverage
description: Live test coverage for ForgeKit — updated on every push to main.
---

<script setup>
import { data } from './coverage.data.js'
const { metrics, tests } = data

const color = (pct) => {
  const n = parseFloat(pct)
  if (n >= 80) return '#10b981'
  if (n >= 60) return '#3b82f6'
  if (n >= 40) return '#f59e0b'
  return '#ef4444'
}

const label = (pct) => {
  const n = parseFloat(pct)
  if (n >= 80) return 'Good'
  if (n >= 60) return 'Fair'
  if (n >= 40) return 'Low'
  return 'Critical'
}
</script>

# Test Coverage

Coverage is collected by [Jest](https://jestjs.io/) with Istanbul on every push to `main` and every pull request. The numbers below were recorded during the last docs build.

---

<template v-if="metrics">

## Summary

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin:24px 0">
  <div v-for="[key, m] in Object.entries(metrics)" :key="key"
    style="background:var(--vp-c-bg-soft);border:1px solid var(--vp-c-divider);border-radius:12px;padding:20px 24px">
    <div style="font-size:13px;text-transform:capitalize;color:var(--vp-c-text-2);margin-bottom:6px">{{ key }}</div>
    <div :style="{fontSize:'32px',fontWeight:700,color:color(m.pct),lineHeight:1}">{{ m.pct }}%</div>
    <div style="font-size:12px;color:var(--vp-c-text-3);margin-top:6px">{{ m.covered }} / {{ m.total }}</div>
    <div :style="{fontSize:'11px',fontWeight:600,color:color(m.pct),marginTop:'4px'}">{{ label(m.pct) }}</div>
  </div>
</div>

<template v-if="tests">

<div style="background:var(--vp-c-bg-soft);border:1px solid var(--vp-c-divider);border-radius:12px;padding:16px 24px;margin-bottom:24px;display:flex;gap:32px;flex-wrap:wrap">
  <div>
    <span style="font-size:13px;color:var(--vp-c-text-2)">Tests passed </span>
    <strong :style="{color: tests.failed > 0 ? '#ef4444' : '#10b981'}">{{ tests.passed }} / {{ tests.total }}</strong>
  </div>
  <div>
    <span style="font-size:13px;color:var(--vp-c-text-2)">Test files </span>
    <strong>{{ tests.files }}</strong>
  </div>
  <div v-if="tests.failed > 0">
    <span style="font-size:13px;color:#ef4444">⚠ {{ tests.failed }} failing</span>
  </div>
</div>

</template>

</template>

<template v-else>

::: info Coverage data not available
Run `npm test --workspace=packages/cli -- --coverage` locally, or wait for the next CI build to populate live metrics.
:::

</template>

## Thresholds

CI fails if coverage drops below:

| Metric | Minimum | Scope |
|--------|---------|-------|
| Lines | 40% | `src/core/**` |
| Functions | 33% | `src/core/**` |
| Branches | 30% | `src/core/**` |

`src/commands/**` is excluded — those are covered by smoke and integration tests in CI.

## Interactive Report

The full Istanbul HTML report with per-file line-by-line highlighting is served at:

**[forgekit.build/coverage/lcov-report/](/coverage/lcov-report/)** *(available after CI deploys)*

## Run locally

```bash
# From repo root
npm test --workspace=packages/cli -- --coverage

# Open the HTML report
open packages/cli/coverage/lcov-report/index.html
```

## Adding tests

Test files live in `packages/cli/src/__tests__/`. See [Contributing](/contributing) for the full guide.
