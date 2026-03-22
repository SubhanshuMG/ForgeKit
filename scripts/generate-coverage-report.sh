#!/usr/bin/env bash
# Copyright 2026 ForgeKit Contributors
# SPDX-License-Identifier: Apache-2.0
# ============================================================================
# ForgeKit Coverage Report Generator
# ============================================================================
# Reads Jest coverage output and generates:
#   coverage-report/COVERAGE.md      - Markdown summary with tables
#   coverage-report/coverage-chart.svg - Metric bar chart (dark theme)
#
# Usage: bash scripts/generate-coverage-report.sh
#
# Required inputs (produced by jest --coverage):
#   packages/cli/coverage/coverage-summary.json
#   packages/cli/coverage/test-results.json    (jest --json output)
# ============================================================================

set -euo pipefail

REPORT_DIR="coverage-report"
COVERAGE_SUMMARY="packages/cli/coverage/coverage-summary.json"
TEST_RESULTS="packages/cli/coverage/test-results.json"

# Also check workspace-relative path (when Jest runs from packages/cli dir)
if [ ! -f "$TEST_RESULTS" ] && [ -f "coverage/test-results.json" ]; then
  TEST_RESULTS="coverage/test-results.json"
fi

mkdir -p "$REPORT_DIR"

# ============================================================================
# Read coverage metrics
# ============================================================================

echo "Reading coverage data..."

if [ -f "$COVERAGE_SUMMARY" ]; then
  LINES_PCT=$(jq '.total.lines.pct // 0' "$COVERAGE_SUMMARY")
  STMTS_PCT=$(jq '.total.statements.pct // 0' "$COVERAGE_SUMMARY")
  BRANCH_PCT=$(jq '.total.branches.pct // 0' "$COVERAGE_SUMMARY")
  FUNC_PCT=$(jq '.total.functions.pct // 0' "$COVERAGE_SUMMARY")

  LINES_COV=$(jq '.total.lines.covered // 0' "$COVERAGE_SUMMARY")
  LINES_TOT=$(jq '.total.lines.total // 0' "$COVERAGE_SUMMARY")
  STMTS_COV=$(jq '.total.statements.covered // 0' "$COVERAGE_SUMMARY")
  STMTS_TOT=$(jq '.total.statements.total // 0' "$COVERAGE_SUMMARY")
  BRANCH_COV=$(jq '.total.branches.covered // 0' "$COVERAGE_SUMMARY")
  BRANCH_TOT=$(jq '.total.branches.total // 0' "$COVERAGE_SUMMARY")
  FUNC_COV=$(jq '.total.functions.covered // 0' "$COVERAGE_SUMMARY")
  FUNC_TOT=$(jq '.total.functions.total // 0' "$COVERAGE_SUMMARY")
else
  echo "Warning: $COVERAGE_SUMMARY not found — using zeros"
  LINES_PCT=0 STMTS_PCT=0 BRANCH_PCT=0 FUNC_PCT=0
  LINES_COV=0 LINES_TOT=0
  STMTS_COV=0 STMTS_TOT=0
  BRANCH_COV=0 BRANCH_TOT=0
  FUNC_COV=0 FUNC_TOT=0
fi

if [ -f "$TEST_RESULTS" ]; then
  TESTS_PASSED=$(jq '.numPassedTests // 0' "$TEST_RESULTS")
  TESTS_TOTAL=$(jq '.numTotalTests // 0' "$TEST_RESULTS")
  TESTS_FILES=$(jq '.numTotalTestSuites // 0' "$TEST_RESULTS")
  TESTS_FAILED=$(jq '.numFailedTests // 0' "$TEST_RESULTS")
else
  TESTS_PASSED=0 TESTS_TOTAL=0 TESTS_FILES=0 TESTS_FAILED=0
fi

# Metadata
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
COMMIT_SHA="${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
SHORT_SHA="${COMMIT_SHA:0:7}"
RUN_ID="${GITHUB_RUN_ID:-local}"
REPO="${GITHUB_REPOSITORY:-SubhanshuMG/ForgeKit}"

# ============================================================================
# Helpers
# ============================================================================

get_bar_color() {
  local pct=$1
  local int_pct=${pct%.*}
  if [ "$int_pct" -ge 80 ]; then echo "#10b981"   # green
  elif [ "$int_pct" -ge 60 ]; then echo "#3b82f6"  # blue
  elif [ "$int_pct" -ge 40 ]; then echo "#f59e0b"  # amber
  else echo "#ef4444"                               # red
  fi
}

get_badge_color() {
  local pct=$1
  local int_pct=${pct%.*}
  if [ "$int_pct" -ge 80 ]; then echo "brightgreen"
  elif [ "$int_pct" -ge 60 ]; then echo "blue"
  elif [ "$int_pct" -ge 40 ]; then echo "yellow"
  else echo "red"
  fi
}

# ============================================================================
# Generate SVG: Coverage Metric Bars (dark theme)
# ============================================================================

echo "Generating coverage-chart.svg..."

BAR_HEIGHT=28
BAR_GAP=14
LABEL_WIDTH=110
BAR_TRACK_WIDTH=280
VALUE_WIDTH=100
SVG_WIDTH=$((LABEL_WIDTH + BAR_TRACK_WIDTH + VALUE_WIDTH + 40))
HEADER_HEIGHT=56
NUM_METRICS=4
SVG_HEIGHT=$((HEADER_HEIGHT + NUM_METRICS * (BAR_HEIGHT + BAR_GAP) + 20))

METRIC_NAMES=("Lines" "Statements" "Branches" "Functions")
METRIC_PCTS=("$LINES_PCT" "$STMTS_PCT" "$BRANCH_PCT" "$FUNC_PCT")
METRIC_COVS=("$LINES_COV/$LINES_TOT" "$STMTS_COV/$STMTS_TOT" "$BRANCH_COV/$BRANCH_TOT" "$FUNC_COV/$FUNC_TOT")

cat > "$REPORT_DIR/coverage-chart.svg" << SVGEOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="${SVG_WIDTH}" height="${SVG_HEIGHT}">
  <defs>
    <linearGradient id="header-line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00d4ff"/>
      <stop offset="100%" stop-color="#00ff88" stop-opacity="0.3"/>
    </linearGradient>
    <linearGradient id="glass-shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.08"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <style>
    .title { font: 700 13px system-ui,-apple-system,sans-serif; fill: #e2e8f0; text-transform: uppercase; letter-spacing: 0.08em; }
    .title-accent { fill: #00d4ff; }
    .label { font: 500 11.5px system-ui,-apple-system,sans-serif; fill: #8b949e; text-anchor: end; dominant-baseline: middle; }
    .value { font: 600 11.5px system-ui,-apple-system,sans-serif; fill: #c9d1d9; dominant-baseline: middle; }
    .pct { font: 700 11px system-ui,-apple-system,sans-serif; dominant-baseline: middle; }
    @keyframes bar-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes fade-in { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
  </style>
  <rect width="100%" height="100%" fill="#0C1117" rx="12"/>
  <text x="22" y="30" class="title"><tspan class="title-accent">Coverage</tspan> Summary</text>
  <line x1="22" y1="44" x2="$((SVG_WIDTH - 22))" y2="44" stroke="url(#header-line)" stroke-width="1.5"/>
SVGEOF

for i in "${!METRIC_NAMES[@]}"; do
  name="${METRIC_NAMES[$i]}"
  pct="${METRIC_PCTS[$i]}"
  cov="${METRIC_COVS[$i]}"
  int_pct=${pct%.*}
  bar_color=$(get_bar_color "$pct")
  bar_w=$((int_pct * BAR_TRACK_WIDTH / 100))
  if [ "$bar_w" -lt 4 ] && [ "$int_pct" -gt 0 ]; then bar_w=4; fi
  y=$((HEADER_HEIGHT + i * (BAR_HEIGHT + BAR_GAP)))
  cy=$((y + BAR_HEIGHT / 2))
  vx=$((LABEL_WIDTH + BAR_TRACK_WIDTH + 10))
  px=$((vx + 72))
  delay_ms=$((i * 100))
  cat >> "$REPORT_DIR/coverage-chart.svg" << EOF
  <g style="animation: fade-in 0.4s ease ${delay_ms}ms both;">
    <text x="$((LABEL_WIDTH - 10))" y="$cy" class="label">$name</text>
    <rect x="$LABEL_WIDTH" y="$y" width="$BAR_TRACK_WIDTH" height="$BAR_HEIGHT" fill="#161b22" rx="6" stroke="#21262d" stroke-width="0.5"/>
    <rect x="$LABEL_WIDTH" y="$y" width="$bar_w" height="$BAR_HEIGHT" fill="$bar_color" rx="6" opacity="0.8" style="transform-origin:${LABEL_WIDTH}px 0;animation:bar-grow 0.8s cubic-bezier(0.4,0,0.2,1) ${delay_ms}ms both;" filter="url(#glow)"/>
    <rect x="$LABEL_WIDTH" y="$y" width="$bar_w" height="$BAR_HEIGHT" fill="url(#glass-shine)" rx="6" style="transform-origin:${LABEL_WIDTH}px 0;animation:bar-grow 0.8s cubic-bezier(0.4,0,0.2,1) ${delay_ms}ms both;"/>
    <text x="$vx" y="$cy" class="value">$cov</text>
    <text x="$px" y="$cy" class="pct" fill="$bar_color">${pct}%</text>
  </g>
EOF
done

echo "</svg>" >> "$REPORT_DIR/coverage-chart.svg"

# ============================================================================
# Generate COVERAGE.md
# ============================================================================

echo "Generating COVERAGE.md..."

# Determine overall health badge
OVERALL_PCT="$LINES_PCT"
OVERALL_COLOR=$(get_badge_color "$OVERALL_PCT")

TESTS_STATUS="passing"
if [ "$TESTS_FAILED" -gt 0 ]; then TESTS_STATUS="failing"; fi

cat > "$REPORT_DIR/COVERAGE.md" << EOF
# ForgeKit Test Coverage

> Auto-generated on **${TIMESTAMP}** from commit [\`${SHORT_SHA}\`](https://github.com/${REPO}/commit/${COMMIT_SHA}) | [CI Run #${RUN_ID}](https://github.com/${REPO}/actions/runs/${RUN_ID})

---

## Summary

| Metric | Coverage | Covered / Total |
|--------|----------|-----------------|
| **Lines** | \`${LINES_PCT}%\` | ${LINES_COV} / ${LINES_TOT} |
| **Statements** | \`${STMTS_PCT}%\` | ${STMTS_COV} / ${STMTS_TOT} |
| **Branches** | \`${BRANCH_PCT}%\` | ${BRANCH_COV} / ${BRANCH_TOT} |
| **Functions** | \`${FUNC_PCT}%\` | ${FUNC_COV} / ${FUNC_TOT} |

> **Tests** : ${TESTS_PASSED} passed / ${TESTS_TOTAL} total  (${TESTS_FAILED} failed)
>
> **Test Files** : ${TESTS_FILES}

---

## Coverage Chart

![Coverage by Metric](/coverage-report/coverage-chart.svg)

---

## Package Breakdown

| Package | Tests | Coverage Report |
|---------|-------|-----------------|
| **forgekit-cli** | ${TESTS_PASSED} / ${TESTS_TOTAL} tests | [View Report](/coverage-report/) |

---

## Interactive Report

Browse line-by-line coverage with file drill-down and inline highlighting.

**[Open Interactive Coverage Report](/coverage-report/)** → full Istanbul HTML report hosted on forgekit.build

---

<sub>Generated by [ForgeKit CI](https://github.com/${REPO}/actions) · Coverage Report workflow</sub>
EOF

# ============================================================================
# Generate badge.json (shields.io endpoint format)
# ============================================================================

echo "Generating badge.json..."

LINES_INT=${LINES_PCT%.*}
if [ "$LINES_INT" -ge 80 ]; then
  BADGE_COLOR="brightgreen"
elif [ "$LINES_INT" -ge 60 ]; then
  BADGE_COLOR="blue"
elif [ "$LINES_INT" -ge 40 ]; then
  BADGE_COLOR="yellow"
else
  BADGE_COLOR="red"
fi

cat > "$REPORT_DIR/badge.json" << EOF
{
  "schemaVersion": 1,
  "label": "coverage",
  "message": "${LINES_PCT}%",
  "color": "${BADGE_COLOR}"
}
EOF

echo ""
echo "Coverage report generated:"
echo "  ${REPORT_DIR}/COVERAGE.md"
echo "  ${REPORT_DIR}/coverage-chart.svg"
echo ""
echo "Metrics:"
echo "  Lines:      ${LINES_PCT}%  (${LINES_COV}/${LINES_TOT})"
echo "  Statements: ${STMTS_PCT}%  (${STMTS_COV}/${STMTS_TOT})"
echo "  Branches:   ${BRANCH_PCT}%  (${BRANCH_COV}/${BRANCH_TOT})"
echo "  Functions:  ${FUNC_PCT}%  (${FUNC_COV}/${FUNC_TOT})"
echo "  Tests:      ${TESTS_PASSED}/${TESTS_TOTAL} passed"
