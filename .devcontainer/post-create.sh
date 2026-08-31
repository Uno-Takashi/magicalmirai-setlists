#!/usr/bin/env bash
# Dev Container 作成後のセットアップ。
set -euo pipefail

echo "==> corepack で pnpm を有効化"
sudo corepack enable
corepack prepare --activate

echo "==> 依存関係をインストール (prepare スクリプトで husky も設定される)"
pnpm install --frozen-lockfile

echo "==> pre-commit フックを確認"
pnpm exec husky
echo "    hooksPath = $(git config --get core.hooksPath || echo '(未設定)')"

echo "==> Playwright (Storybook のブラウザテスト用) をインストール"
pnpm exec playwright install --with-deps chromium

# バインドマウントしたホスト設定は uid が食い違うことがあるので所有者を揃える。
for dir in "$HOME/.claude" "$HOME/.config/gh"; do
  if [ -d "$dir" ] && [ ! -w "$dir" ]; then
    echo "==> $dir の所有者を $(id -un) に変更"
    sudo chown -R "$(id -u):$(id -g)" "$dir"
  fi
done

if gh auth status >/dev/null 2>&1; then
  echo "==> gh は認証済みです"
else
  echo "==> gh は未認証です。'gh auth login' を実行するか、ホストで GH_TOKEN を設定してください"
fi

echo "==> フォーマットチェック (oxfmt)"
pnpm run format:check || echo "    未フォーマットのファイルがあります。'pnpm run format' を実行してください"

echo "==> セットアップ完了"
