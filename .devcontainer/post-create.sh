#!/usr/bin/env bash
# Dev Container 作成後のセットアップ。
set -euo pipefail

echo "==> corepack で pnpm を有効化"
# sudo は付けない。node は Feature が nvm 配下 (/usr/local/share/nvm/...) に入れるが、
# sudo の secure_path にそのパスが無いので `sudo corepack` は command not found になる。
# nvm の bin は vscode:nvm の group-writable なので、そのまま実行すればよい。
corepack enable
corepack prepare --activate

echo "==> 依存関係をインストール (prepare スクリプトで husky も設定される)"
# CI=true を付けるのは pnpm を非対話にするため。ホスト側で作られた node_modules が
# 残っていると store のパスが食い違うので pnpm は作り直しの確認を出すが、
# postCreateCommand には TTY が無いので確認できずに中断してしまう。
CI=true pnpm install --frozen-lockfile

echo "==> pre-commit フックを確認"
pnpm exec husky
echo "    hooksPath = $(git config --get core.hooksPath || echo '(未設定)')"

echo "==> Playwright (Storybook のブラウザテスト用) をインストール"
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
