#!/usr/bin/env bash
# ランタイムと道具の版が「どこに」「いくつで」書かれているかを集める。
# Dependabot が見ていない箇所（node-version · packageManager · devcontainer など）を
# 取りこぼさないためのもの。判断は toolchain.md の手順。
#
#   pins.sh            ピンの一覧と、同じものを指すピン同士の食い違い
#   pins.sh latest     上流の最新版とサポート期限（ネットワークと gh が要る）
set -uo pipefail

ROOT=$(git rev-parse --show-toplevel) || exit 2
cd "$ROOT" || exit 2

usage() {
  sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//'
  exit 2
}

GROUPS_SEEN=()
P_GROUP=()
P_WHERE=()
P_VALUE=()
P_LINE=()

# pin <グループ> <場所> <書かれている値> <比較に使う系統>
# 系統が空のものは一覧に出すだけで、食い違いの判定には使わない。
pin() {
  [ -n "$3" ] || return 0
  local g
  for g in "${GROUPS_SEEN[@]:-}"; do [ "$g" = "$1" ] && g=found && break; done
  [ "${g:-}" = found ] || GROUPS_SEEN+=("$1")
  P_GROUP+=("$1")
  P_WHERE+=("$2")
  P_VALUE+=("$3")
  P_LINE+=("${4:-}")
}

major() { grep -oE '[0-9]+' <<<"$1" | head -n1; }

DC=.devcontainer/devcontainer.json
DC_LOCK=.devcontainer/devcontainer-lock.json

# devcontainer.json はコメント入りなので jq では読めない。feature の次の "version" を拾う。
devcontainer_feature_version() {
  awk -v feat="$1" '
    index($0, feat) { hit = 1; if ($0 ~ /\{ *\}/) exit; next }
    hit && /"version"/ { gsub(/[",]/, "", $2); print $2; exit }
    hit && /\}/ { exit }' "$DC"
}

# devcontainer.json に書いた feature の参照（"ghcr.io/...:1"）
devcontainer_features() {
  grep -oE '"ghcr\.io/[^"]+"' "$DC" | tr -d '"'
}

# ワークフローに出てくる値を「値 xN」でまとめる。
# shellcheck disable=SC2016
# ${{ ... }} は式なので値として数えない。ここで展開させたいわけではない。
workflow_values() { # workflow_values <キー>
  grep -rhoE "^ +$1: *[^#]+" .github/workflows | sed -E "s/^ +$1: *//; s/ +\$//" | tr -d "\"'" |
    grep -v '\${{' | sort | uniq -c |
    awk '{ n = $1; $1 = ""; sub(/^ /, ""); printf "%s%s x%s", (NR > 1 ? ", " : ""), $0, n }'
}

collect() {
  local v f

  # ── Node ──
  # devcontainer と CI は LTS を浮かせて取る（ピンは無い）。型と実際の版の major を比べる。
  pin node "$DC (feature node)" "$(devcontainer_feature_version 'features/node:')" ""
  pin node ".github/workflows node-version" "$(workflow_values node-version)" ""
  v=$(jq -r '.devDependencies["@types/node"] // .dependencies["@types/node"] // empty' package.json)
  pin node "package.json @types/node" "$v" "$(major "$v")"
  pin node "package.json engines.node" "$(jq -r '.engines.node // empty' package.json)" ""
  v=$(node -v 2>/dev/null)
  pin node "local (node -v)" "$v" "$(major "$v")"

  # ── pnpm ──
  # pnpm/action-setup と corepack はどちらも packageManager を読む。
  v=$(jq -r '.packageManager // empty' package.json)
  pin pnpm "package.json packageManager" "$v" "${v#pnpm@}"
  v=$(pnpm -v 2>/dev/null)
  pin pnpm "local (pnpm -v)" "$v" "$v"

  # ── TypeScript（tsc -b で typecheck とビルドの両方に効く）──
  pin typescript "package.json typescript" "$(jq -r '.devDependencies.typescript // empty' package.json)" ""

  # ── Playwright（Storybook のテストと smoke が使う。ブラウザは版ごとに入れ直しが要る）──
  v=$(jq -r '.devDependencies.playwright // empty' package.json)
  pin playwright "package.json playwright" "$v" ""
  v=$(node -p 'require("playwright/package.json").version' 2>/dev/null)
  pin playwright "node_modules playwright" "$v" ""

  # ── Dev Container ──
  v=$(grep -oE '"image": *"[^"]+"' "$DC" | cut -d'"' -f4)
  pin devcontainer "$DC image" "$v" ""
  while IFS= read -r f; do
    v=$(jq -r --arg f "$f" '.features[$f].version // "（lock に無い）"' "$DC_LOCK" 2>/dev/null)
    pin devcontainer "$f" "lock: $v" ""
  done < <(devcontainer_features)

  # ── 浮いている指定（タグが動くので、更新が PR を経ずに入る）──
  while read -r count where; do
    pin floating "${where%%:*}" "${where#*:} x$count" ""
  done < <(grep -rHoE 'lts/\*|"version": *"lts"|[a-z]+-latest|releases/latest|@latest|:latest' \
    .github/workflows "$DC" .devcontainer/post-create.sh 2>/dev/null |
    sed -E 's/"version": *"lts"/lts/' | sort | uniq -c)

  # ── GitHub Actions ──
  pin actions ".github/workflows runs-on" "$(workflow_values runs-on)" ""
  while read -r count action; do
    pin actions "uses x$count" "$action" ""
  done < <(grep -rhoE 'uses: *[^ ]+' .github/workflows | sed -E 's/uses: *//' | sort | uniq -c | sort -k2)
}

cmd_list() {
  collect
  local g i lines mismatch=0
  for g in "${GROUPS_SEEN[@]}"; do
    printf '\n== %s\n' "$g"
    lines=""
    for i in "${!P_GROUP[@]}"; do
      [ "${P_GROUP[$i]}" = "$g" ] || continue
      printf '  %-60s %s\n' "${P_WHERE[$i]}" "${P_VALUE[$i]}"
      [ -n "${P_LINE[$i]}" ] && lines+="${P_LINE[$i]}"$'\n'
    done
    if [ "$(printf '%s' "$lines" | sort -u | grep -c .)" -gt 1 ]; then
      printf '  ⚠ 系統が揃っていない: %s\n' "$(printf '%s' "$lines" | sort -u | paste -sd ' ')"
      mismatch=1
    fi
  done
  # devcontainer.json の feature が lock に無いと、作り直すたびに違う版が入る。
  if grep -q '（lock に無い）' <<<"${P_VALUE[*]}"; then
    echo
    echo "⚠ lock に無い feature がある（devcontainer upgrade --workspace-folder . で lock を作り直す）"
    mismatch=1
  fi
  echo
  if [ "$mismatch" = 1 ]; then
    echo "食い違いあり（⚠ の行）。揃えるか、分けている理由を確かめる。"
  else
    echo "同じものを指すピンは揃っている。"
  fi
}

# ── latest ───────────────────────────────────────────────────────────────────
eol_cycles() { # eol_cycles <endoflife.date の製品名> <いまの系統>
  printf '\n== %s（いま: %s）\n' "$1" "$2"
  curl -fsS -m 20 "https://endoflife.date/api/$1.json" |
    jq -r --arg cur "$2" '
      .[0:5][]
      | "  \(if .cycle == $cur then "→" else " " end) \(.cycle)\t最新 \(.latest)\tEOL \(if .eol == false then "未定" else .eol end)\(if .lts then "\tLTS \(.lts)" else "" end)"' ||
    echo "  取得できなかった"
}

latest_tag() { # latest_tag <owner/repo>
  gh api "repos/$1/tags?per_page=100" -q '.[].name' 2>/dev/null |
    grep -E '^v?[0-9]+(\.[0-9]+)*$' | sort -V | tail -n1
}

cmd_latest() {
  collect
  local i cur
  line_of() { # グループの最初の系統
    for i in "${!P_GROUP[@]}"; do
      [ "${P_GROUP[$i]}" = "$1" ] && [ -n "${P_LINE[$i]}" ] && printf '%s' "${P_LINE[$i]}" && return
    done
  }
  eol_cycles nodejs "$(line_of node)"
  eol_cycles ubuntu "$(grep -oE 'ubuntu-[0-9.]+' "$DC" | head -n1 | sed 's/^ubuntu-//')"

  cur=$(line_of pnpm)
  printf '\n== pnpm（いま: %s）\n' "$cur"
  curl -fsS -m 20 https://registry.npmjs.org/pnpm |
    jq -r --arg m "latest-${cur%%.*}" '
      . as $p | ."dist-tags" | to_entries[]
      | select(.key == "latest" or .key == $m)
      | "  \(.key)\t\(.value)\t公開 \($p.time[.value])"' || echo "  取得できなかった"

  printf '\n== GitHub Actions（使っている参照 → 上流の最新タグ）\n'
  local ref repo used newest mark
  while read -r ref; do
    used=${ref##*@}
    repo=$(cut -d/ -f1,2 <<<"${ref%@*}")
    newest=$(latest_tag "$repo")
    mark=" "
    [ -n "$newest" ] && [ "$(major "$used")" != "$(major "$newest")" ] && mark="⚠"
    printf '  %s %-52s 最新 %s\n' "$mark" "$ref" "${newest:-?}"
  done < <(grep -rhoE 'uses: *[^ ]+' .github/workflows | sed -E 's/uses: *//' | grep -v '^\./' | sort -u)
  echo "  ⚠ は major が違う。major タグ（@v7 など）は動くので、同じ major の中の更新は PR を経ずに入る。"

  printf '\n== Dev Container の feature\n'
  if command -v devcontainer >/dev/null 2>&1; then
    devcontainer outdated --workspace-folder . --output-format text 2>/dev/null | sed 's/^/  /' ||
      echo "  取得できなかった"
  else
    echo "  devcontainer CLI が無い（ホストで devcontainer outdated --workspace-folder . を回す）"
  fi
}

case "${1:-list}" in
  list) cmd_list ;;
  latest) cmd_latest ;;
  *) usage ;;
esac
