#!/usr/bin/env bash
# 保守用のローカルゲート。CI（.github/workflows/ci.yml）と同じ検査に、CI に無い
# 成果物の検査と実ブラウザでの起動確認を足して、いまの作業ツリーに対して回し、結果を表で出す。
#
#   gates.sh                  すべての区分
#   gates.sh static dist      指定した区分だけ
#
# 区分:
#   static  pnpm install --frozen-lockfile · format:check · lint · typecheck ·
#           test:dataset · test:unit · build · build-storybook（CI の verify ジョブ + unit）
#   test    pnpm test（unit · dataset · Storybook のストーリーを Chromium で。CI の test ジョブ）
#   dist    build の成果物を検査する（sitemap の全ページの HTML · canonical · 404.html ·
#           robots.txt · index.html が参照する資産）。成果物の sha256 を dist.sha256 に残す
#   smoke   vite preview を起動し、sitemap の全ページを Chromium で開いて、描画されること・
#           ページのエラーと console.error が無いことを確かめる
#   repo    actionlint · shellcheck
#
# dist と smoke は dist/ を読む。static と同じ実行で回す（無ければ FAIL。古いビルドを検査しない）。
# 1 つ落ちても残りは回す（何が落ちるかを 1 回で知るため）。失敗があれば終了コード 1。
# SKIP は「通った」ではない。道具が無くて回せなかった検査なので、CI の結果で補う。
# ログは GATES_LOG_DIR（未指定なら一時ディレクトリ）に検査ごとに残る。落ちた検査は末尾
# GATES_TAIL 行（既定 25）を最後に出す。
#
# shellcheck disable=SC2317,SC2329
# 検査の本体は関数にして step へ引数で渡している。shellcheck からは未使用に見える。
set -uo pipefail

ROOT=$(git rev-parse --show-toplevel) || exit 2
cd "$ROOT" || exit 2
SCRIPTS=$(cd "$(dirname "$0")" && pwd)

LOG_DIR=${GATES_LOG_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/gates.XXXXXX")}
mkdir -p "$LOG_DIR"
LOG_DIR=$(cd "$LOG_DIR" && pwd) || exit 2 # 検査は cd した先で走るので、絶対パスにする
export LOG_DIR

ALL_SECTIONS=(static test dist smoke repo)
NAMES=()
STATUSES=()
SECONDS_TAKEN=()
NOTES=()
BUILT=0 # この実行で build が通ったか（dist · smoke は古い dist/ を検査しない）

record() {
  NAMES+=("$1")
  STATUSES+=("$2")
  SECONDS_TAKEN+=("$3")
  NOTES+=("${4:-}")
}

# step <名前> <コマンド...>（ルートで実行する）
step() {
  local name=$1
  shift
  local log start=$SECONDS
  log=$(printf '%s/%02d-%s.log' "$LOG_DIR" "${#NAMES[@]}" "$(printf '%s' "$name" | tr -cs 'A-Za-z0-9.-' '_')")
  printf '▶ %s\n' "$name"
  if (cd "$ROOT" && "$@") >"$log" 2>&1; then
    record "$name" PASS $((SECONDS - start))
    return 0
  fi
  record "$name" FAIL $((SECONDS - start)) "$log"
  printf '  ✗ FAIL（%s）\n' "$log"
  return 1
}

skip() {
  record "$1" SKIP 0 "$2"
  printf '▷ %s: SKIP（%s）\n' "$1" "$2"
}

have() { command -v "$1" >/dev/null 2>&1; }

# Playwright の Chromium が入っているか（test · smoke が使う）
have_chromium() {
  node -e '
    const fs = require("fs");
    const { chromium } = require("playwright");
    process.exit(fs.existsSync(chromium.executablePath()) ? 0 : 1);
  ' 2>/dev/null
}

# ── CI の verify ジョブ ──────────────────────────────────────────────────────
gate_static() {
  step "static: pnpm install --frozen-lockfile" pnpm install --frozen-lockfile
  step "static: format:check" pnpm run format:check
  step "static: lint" pnpm run lint
  step "static: typecheck" pnpm run typecheck
  step "static: test:dataset" pnpm run test:dataset
  step "static: test:unit" pnpm run test:unit
  step "static: build" pnpm run build && BUILT=1
  step "static: build-storybook" pnpm run build-storybook
}

# ── CI の test ジョブ ────────────────────────────────────────────────────────
gate_test() {
  if ! have_chromium; then
    skip "test: pnpm test" "Chromium が無い（pnpm exec playwright install --with-deps chromium）"
    return
  fi
  step "test: pnpm test" pnpm run test
}

# ── 成果物 ───────────────────────────────────────────────────────────────────
need_build() {
  if [ "$BUILT" != 1 ]; then
    skip "$1" "この実行で build が通っていない（gates.sh static $2 で回す）"
    return 1
  fi
}

gate_dist() {
  need_build "dist: pages · sitemap · canonical" dist || return
  step "dist: pages · sitemap · canonical" node "$SCRIPTS/check-dist.mjs" dist
}

gate_smoke() {
  need_build "smoke: browser" smoke || return
  if ! have_chromium; then
    skip "smoke: browser" "Chromium が無い（pnpm exec playwright install --with-deps chromium）"
    return
  fi
  step "smoke: browser" node "$SCRIPTS/smoke.mjs" dist
}

# ── リポジトリ全体 ───────────────────────────────────────────────────────────
# 未追跡でも .gitignore されていないものは含める（コミット前の新しいスクリプトも見る）。
shellcheck_all() {
  local files
  mapfile -t files < <(git ls-files -co --exclude-standard '*.sh')
  shellcheck "${files[@]}"
}

gate_repo() {
  if have actionlint; then step "repo: actionlint" actionlint; else skip "repo: actionlint" "actionlint が無い"; fi
  if have shellcheck; then step "repo: shellcheck" shellcheck_all; else skip "repo: shellcheck" "shellcheck が無い"; fi
}

# ── 実行 ─────────────────────────────────────────────────────────────────────
if [ $# -eq 0 ]; then
  SECTIONS=("${ALL_SECTIONS[@]}")
else
  SECTIONS=("$@")
fi

# 途中まで回してから止まらないよう、名前を先に確かめる。
for section in "${SECTIONS[@]}"; do
  case " ${ALL_SECTIONS[*]} " in
    *" $section "*) ;;
    *)
      echo "unknown section: $section（${ALL_SECTIONS[*]}）" >&2
      exit 2
      ;;
  esac
done

# dist · smoke だけを指定されたら、build だけ先に回す（古い dist/ を検査しないため）。
case " ${SECTIONS[*]} " in
  *" static "*) ;;
  *" dist "* | *" smoke "*) step "build" pnpm run build && BUILT=1 ;;
esac

for section in "${SECTIONS[@]}"; do
  case "$section" in
    static) gate_static ;;
    test) gate_test ;;
    dist) gate_dist ;;
    smoke) gate_smoke ;;
    repo) gate_repo ;;
  esac
done

failed=0
printf '\n%-46s %-6s %5s\n' "CHECK" "RESULT" "SEC"
for i in "${!NAMES[@]}"; do
  printf '%-46s %-6s %5s  %s\n' "${NAMES[$i]}" "${STATUSES[$i]}" "${SECONDS_TAKEN[$i]}" "${NOTES[$i]}"
  [ "${STATUSES[$i]}" = FAIL ] && failed=1
done

# 落ちた検査はログの末尾を出す。足りなければログを grep する（全部は読まない）。
for i in "${!NAMES[@]}"; do
  [ "${STATUSES[$i]}" = FAIL ] || continue
  printf '\n── %s（末尾 %s 行）\n' "${NAMES[$i]}" "${GATES_TAIL:-25}"
  tail -n "${GATES_TAIL:-25}" "${NOTES[$i]}"
done
printf '\nログ: %s\n' "$LOG_DIR"
exit "$failed"
