#!/usr/bin/env bash
# Dev Container 作成後のセットアップ。
set -euo pipefail

echo "==> corepack で pnpm を有効化"
# Node 25 以降は corepack を同梱しない。Feature の Node は "lts" で浮いているので、
# LTS が 26 に切り替わった時点から corepack が無くなった。そのときは Feature が入れた
# pnpm をそのまま使う。pnpm は package.json の packageManager を読み、その版へ自分で
# 切り替える (manage-package-manager-versions)。npm で corepack を入れ直すと、
# Feature の pnpm と bin が衝突して失敗する。
# sudo は付けない。node は Feature が nvm 配下 (/usr/local/share/nvm/...) に入れるが、
# sudo の secure_path にそのパスが無いので `sudo corepack` は command not found になる。
# nvm の bin は vscode:nvm の group-writable なので、そのまま実行すればよい。
if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare --activate
else
  echo "    corepack が無い (Node $(node -v))。Feature の pnpm を使う"
fi
echo "    pnpm $(pnpm -v) (packageManager: $(node -p 'require("./package.json").packageManager'))"

echo "==> 依存関係をインストール (prepare スクリプトで husky も設定される)"
# CI=true を付けるのは pnpm を非対話にするため。ホスト側で作られた node_modules が
# 残っていると store のパスが食い違うので pnpm は作り直しの確認を出すが、
# postCreateCommand には TTY が無いので確認できずに中断してしまう。
CI=true pnpm install --frozen-lockfile

echo "==> pre-commit フックを確認"
pnpm exec husky
echo "    hooksPath = $(git config --get core.hooksPath || echo '(未設定)')"

echo "==> Playwright のヘッドレス Chromium をインストール"
# Storybook のテスト (pnpm test) と、画面の確認・PR に貼るスクリーンショットに使う
# (CLAUDE.md「画面の確認とスクリーンショット」)。--with-deps が OS のライブラリと
# フォント (日本語は IPA ゴシック、ハングルは WenQuanYi) も入れるので、文字は化けない。
pnpm exec playwright install --with-deps chromium

# バインドマウントしたホスト設定は uid が食い違うことがあるので所有者を揃える。
claude_dir="$HOME/.claude"
if [ -d "$claude_dir" ] && [ ! -w "$claude_dir" ]; then
  echo "==> $claude_dir の所有者を $(id -un) に変更"
  sudo chown -R "$(id -u):$(id -g)" "$claude_dir"
fi

# rtk (Rust Token Killer) は Claude Code の出力を圧縮する CLI プロキシ。
# Feature (ghcr.io/awf-project/devcontainer-features/rtk) は使わない。あれはイメージの
# ビルド中に `rtk init --global` で ~/.claude へ書こうとするが、その時点で ~/.claude は
# まだ無く (ホストからの bind mount は起動時に張られる)、Feature の失敗がコンテナ作成
# そのものを止めてしまうため。設定 (RTK.md と settings.json のフック) はマウントした
# ホストの ~/.claude にあるので、ここで入れるのはバイナリだけでよい。
echo "==> rtk をインストール"
if command -v rtk >/dev/null 2>&1; then
  echo "    インストール済み: $(rtk --version)"
else
  case "$(uname -m)" in
    # arm64 向けの musl ビルドは配布されていないので gnu を使う
    x86_64) rtk_target='x86_64-unknown-linux-musl' ;;
    aarch64 | arm64) rtk_target='aarch64-unknown-linux-gnu' ;;
    *) rtk_target='' ;;
  esac

  if [ -z "$rtk_target" ]; then
    echo "    $(uname -m) 向けの配布物が無いので飛ばします"
  elif curl -fsSL "https://github.com/rtk-ai/rtk/releases/latest/download/rtk-${rtk_target}.tar.gz" |
    sudo tar -xz -C /usr/local/bin rtk; then
    echo "    $(rtk --version) を /usr/local/bin に入れました"
  else
    # rtk は無くても開発はできるので、ここで作成を止めない
    echo "    インストールに失敗しました (rtk 無しでも開発はできます)"
  fi
fi

# gh の認証はホストから渡る GH_TOKEN に一任している (設定ディレクトリはマウントしない)。
# GH_TOKEN が設定されている間は `gh auth login` が拒否されるので、案内には出さない。
if gh auth status >/dev/null 2>&1; then
  echo "==> gh は認証済みです"
else
  echo "==> gh は未認証です。ホストの環境変数に GH_TOKEN を設定してください ('gh auth token' の値か PAT)"
fi

echo "==> フォーマットチェック (oxfmt)"
pnpm run format:check || echo "    未フォーマットのファイルがあります。'pnpm run format' を実行してください"

echo "==> セットアップ完了"
