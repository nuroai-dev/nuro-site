# harness.config.example.sh — per-project configuration for the Claude-native
# card-auto-merge harness. Copy to <your-repo>/.claude-harness/harness.config.sh
# and fill in. Step scripts and the conductor skill source this at runtime.
# Keep it to plain KEY=VALUE assignments — it is sourced, not run.

# ── Where the harness lives (this repo's checkout) ───────────────────────────
HARNESS_DIR="${HARNESS_DIR:-$HOME/claude-harness}"

# ── Tracker ──────────────────────────────────────────────────────────────────
# Which adapter to use: "github" (GitHub Issues) or "jira".
HARNESS_TRACKER="github"

# GitHub tracker needs the repo slug. Jira tracker ignores it.
HARNESS_REPO="dumplingsol/nuro-site"

# The GitHub repo where PRs live (owner/repo). Same as HARNESS_REPO for the
# github tracker; set explicitly when the tracker is jira but PRs are on GitHub.
HARNESS_PR_REPO="${HARNESS_REPO}"

# Jira tracker needs the path to the project's own jira.sh. GitHub ignores it.
# HARNESS_JIRA_CLI="$HOME/teamkit/scripts/jira.sh"

# Who the agent assigns cards to. github default @me, jira default "claude".
# HARNESS_AGENT_ASSIGNEE="@me"

# Card id format, validated at setup. KAN-\d+ for Jira, \d+ for GitHub issues.
HARNESS_CARD_PATTERN='^[0-9]+$'

# ── Validation ───────────────────────────────────────────────────────────────
# Shell run by step-validate.sh from the worktree root. Print test/lint/build
# output; exit code is advisory (CI is the real gate).
HARNESS_VALIDATE='
  echo "--- typecheck ---"; pnpm typecheck 2>&1 | tail -40
  echo "--- lint ---";      pnpm lint 2>&1 | tail -40
  echo "--- build ---";     pnpm build 2>&1 | tail -40
'
# Hard ceiling for the validate step (ms). 30 min covers monorepo test fans.
HARNESS_VALIDATE_TIMEOUT_MS=1800000

# Auto-format / lint-fix the files the PR touched, in the deterministic
# mechanical-fix step (before independent review). Receives changed paths in
# $CHANGED. Language-agnostic. Empty = skip.
#   JS:     'pnpm exec prettier --write $CHANGED; pnpm exec eslint --fix $CHANGED'
#   Python: 'ruff format $CHANGED; ruff check --fix $CHANGED'
#   Go:     'gofmt -w $CHANGED'
HARNESS_FORMAT='pnpm exec prettier --write $CHANGED; pnpm exec eslint --fix $CHANGED'

# ── Context the writer agents must read (newline-separated paths) ────────────
HARNESS_SKILLS="$HOME/agent-core/skills/production-code-discipline.md
$HOME/agent-core/skills/tdd/SKILL.md"

# Checklist files the independent (codex) reviewer reads (newline-separated).
HARNESS_REVIEW_CHECKLISTS="$HOME/agent-core/skills/review/checklist.md
$HOME/agent-core/skills/code-review.md"

# ── Merge ────────────────────────────────────────────────────────────────────
HARNESS_BASE_BRANCH="main"
HARNESS_MERGE_FLAGS="--squash"   # branch cleanup is delegated to the repo setting

# ── Models ───────────────────────────────────────────────────────────────────
# Writer phases run as Claude Code SUBAGENTS spawned by the conductor session.
# The Agent tool takes a model TIER, not an exact id: opus | sonnet | haiku.
HARNESS_WRITER_AGENT_MODEL="opus"
HARNESS_PREFLIGHT_AGENT_MODEL="haiku"

# Independent reviewer: a DIFFERENT vendor, via its own CLI (unaffected by any
# Claude auth change). The prompt is appended as the last argument.
HARNESS_CODEX_CMD="codex exec --full-auto"
HARNESS_REVIEW_MAX_ITERS=3

# ── Wave runner ──────────────────────────────────────────────────────────────
# Max cards one /card-wave sweep picks up (sequential in-session).
HARNESS_WAVE_SIZE=3

# ── Telemetry ────────────────────────────────────────────────────────────────
HARNESS_TELEMETRY_DIR="$HOME/.claude-harness/telemetry"
