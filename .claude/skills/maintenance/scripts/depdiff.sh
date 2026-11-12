#!/usr/bin/env bash
# 依存更新で「何が変わるか」の材料を揃える。読んで判断するのは investigation.md の手順。
#
#   depdiff.sh lock <base> [<head>]     pnpm-lock.yaml の解決結果の差。head を省くと作業ツリーと比べる
#   depdiff.sh npm  <pkg> <old> <new>   npm に公開された tarball 同士の差（公開情報 · package.json · ファイル）
#
# npm は tarball を新しい一時ディレクトリへ展開して比べるだけで、中身は実行しない。
# 展開先は最後に表示する。続きは `git diff --no-index <old の展開先>/<path> <new の展開先>/<path>` で読む。
set -euo pipefail

usage() {
  sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'
  exit 2
}

# ── lock ─────────────────────────────────────────────────────────────────────
read_at() { # read_at <ref|WORKTREE> <path>
  if [ "$1" = WORKTREE ]; then cat "$2"; else git show "$1:$2"; fi
}

# 1 行 1 パッケージで「名前<TAB>バージョン」を出す（lockfileVersion 9 の packages:）。
pnpm_resolved() {
  read_at "$1" pnpm-lock.yaml | awk '
    /^packages:/ { on = 1; next }
    /^[a-zA-Z]/  { on = 0 }
    on && /^  [^ ].*:$/ {
      key = $0
      sub(/^  /, "", key); sub(/:$/, "", key); gsub(/\047/, "", key)
      i = match(key, /@[^@]*$/)
      print substr(key, 1, i - 1) "\t" substr(key, i + 1)
    }' | sort -u
}

# 直接依存の指定（package.json の範囲）を「名前<TAB>範囲」で出す。
direct_specs() {
  read_at "$1" package.json | jq -r '
    [.dependencies // {}, .devDependencies // {}, .optionalDependencies // {}] | add
    | to_entries[] | "\(.key)\t\(.value)"' | sort -u
}

# 同じ名前が複数バージョンで入ることがある（zod 3 と 4 など）ので、名前ごとに束ねて比べる。
pair() { # pair <old の一覧> <new の一覧>
  {
    sed 's/^/O\t/' "$1"
    sed 's/^/N\t/' "$2"
  } | awk -F'\t' '
    $1 == "O" { old[$2] = old[$2] (old[$2] ? ", " : "") $3 }
    $1 == "N" { new[$2] = new[$2] (new[$2] ? ", " : "") $3 }
    { names[$2] }
    END {
      for (n in names) if (old[n] != new[n])
        printf "%-46s %s -> %s\n", n, (old[n] ? old[n] : "(なし)"), (new[n] ? new[n] : "(削除)")
    }' | sort
}

cmd_lock() {
  [ $# -ge 1 ] || usage
  local base=$1 head=${2:-WORKTREE}
  tmp=$(mktemp -d)
  trap 'rm -rf "$tmp"' EXIT
  cd "$(git rev-parse --show-toplevel)"

  echo "== package.json の直接依存（$base -> $head）"
  direct_specs "$base" >"$tmp/spec.old"
  direct_specs "$head" >"$tmp/spec.new"
  pair "$tmp/spec.old" "$tmp/spec.new"

  echo
  echo "== pnpm-lock.yaml の解決結果（$base -> $head）"
  pnpm_resolved "$base" >"$tmp/pnpm.old"
  pnpm_resolved "$head" >"$tmp/pnpm.new"
  pair "$tmp/pnpm.old" "$tmp/pnpm.new"

  echo
  echo "== pnpm-lock.yaml の設定（overrides など。差が無ければ何も出ない）"
  diff <(read_at "$base" pnpm-lock.yaml | sed -n '/^settings:/,/^importers:/p') \
    <(read_at "$head" pnpm-lock.yaml | sed -n '/^settings:/,/^importers:/p') || true
}

# ── npm ──────────────────────────────────────────────────────────────────────
# 互換性と供給元に関わる項目だけを抜き出す。
npm_manifest_view() {
  jq -S '{
    dependencies, peerDependencies, peerDependenciesMeta, optionalDependencies,
    engines, type, main, module, types, exports, bin, license, sideEffects,
    installScripts: ((.scripts // {}) | with_entries(select(.key | test("^(pre|post)?install$|^prepare$"))))
  } | with_entries(select(.value != null and .value != {}))' "$1"
}

cmd_npm() {
  [ $# -eq 3 ] || usage
  local pkg=$1 old=$2 new=$3 work v
  work=$(mktemp -d "${TMPDIR:-/tmp}/depdiff-npm.XXXXXX")

  # 公開日時は packument 全体にしか載っていない。
  curl -fsS "https://registry.npmjs.org/$pkg" -o "$work/packument.json"

  echo "== 公開情報"
  for v in "$old" "$new"; do
    curl -fsS "https://registry.npmjs.org/$pkg/$v" -o "$work/$v.json"
    jq -r --arg v "$v" --slurpfile p "$work/packument.json" '
      "\($v)  公開: \($p[0].time[$v] // "?")  公開者: \(._npmUser.name // "?")  provenance: \(if .dist.attestations then "あり" else "なし" end)  deprecated: \((.deprecated // "-") | tostring | .[0:80])"
    ' "$work/$v.json"
    mkdir "$work/$v"
    curl -fsS "$(jq -r '.dist.tarball' "$work/$v.json")" -o "$work/$v.tgz"
    tar -xzf "$work/$v.tgz" -C "$work/$v" --strip-components=1 --no-same-owner
  done
  jq -r '"maintainers: \([.maintainers[]?.name] | join(", "))"' "$work/packument.json"

  echo
  echo "== package.json の差（依存・engines・exports・install スクリプト・ライセンス）"
  diff -u --label "$old" --label "$new" \
    <(npm_manifest_view "$work/$old/package.json") \
    <(npm_manifest_view "$work/$new/package.json") || true

  echo
  echo "== ファイルの差"
  (cd "$work" && git diff --no-index --stat --stat-width=120 "$old" "$new" | tail -n 60) || true

  echo
  echo "展開先: $work/$old  $work/$new"
}

case "${1:-}" in
  lock) shift && cmd_lock "$@" ;;
  npm) shift && cmd_npm "$@" ;;
  *) usage ;;
esac
