// VitePress build-time data loader for test coverage metrics.
// Runs during `vitepress build` — reads Jest JSON output generated
// earlier in the same CI step (docs.yml runs tests before building).
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

export default {
  load() {
    const summaryPath = resolve(__dir, '../packages/cli/coverage/coverage-summary.json')
    const resultsPath = resolve(__dir, '../packages/cli/coverage/test-results.json')

    let metrics = null
    let tests = null

    if (existsSync(summaryPath)) {
      const s = JSON.parse(readFileSync(summaryPath, 'utf-8'))
      const fmt = (n) => parseFloat(n).toFixed(1)
      metrics = {
        lines:      { pct: fmt(s.total.lines.pct),      covered: s.total.lines.covered,      total: s.total.lines.total },
        statements: { pct: fmt(s.total.statements.pct), covered: s.total.statements.covered, total: s.total.statements.total },
        branches:   { pct: fmt(s.total.branches.pct),   covered: s.total.branches.covered,   total: s.total.branches.total },
        functions:  { pct: fmt(s.total.functions.pct),  covered: s.total.functions.covered,  total: s.total.functions.total },
      }
    }

    if (existsSync(resultsPath)) {
      const r = JSON.parse(readFileSync(resultsPath, 'utf-8'))
      tests = {
        passed: r.numPassedTests ?? 0,
        failed: r.numFailedTests ?? 0,
        total:  r.numTotalTests  ?? 0,
        files:  r.numTotalTestSuites ?? 0,
      }
    }

    return { metrics, tests }
  }
}
