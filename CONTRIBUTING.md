# CONTRIBUTING

## 開発フロー: GitHub Flow

**このプロジェクトは GitHub Flow で開発しています。**

GitHub Flow はブランチが 1 本 (`main`) だけのシンプルなフローです。`main` は常に
デプロイ可能な状態を保ちます。`develop` や `release` といった長命ブランチは作りません。

### 手順

1. **`main` からトピックブランチを切る**

   ```bash
   git switch main
   git pull origin main
   git switch -c feat/setlist-filter
   ```

   ブランチ名は `<種別>/<内容>` の形式にします。
   種別: `feat` / `fix` / `docs` / `refactor` / `test` / `chore`

2. **コミットする**

   小さく意味のある単位でコミットします。コミット時に pre-commit フック
   (husky + lint-staged) が oxfmt のフォーマットチェックと oxlint を実行します。

   フォーマットで落ちた場合は書き換えずに失敗するので、次を実行して再コミットします。

   ```bash
   pnpm format
   ```

3. **push して Pull Request を開く**

   ```bash
   git push -u origin feat/setlist-filter
   gh pr create --fill
   ```

   作業途中で議論したい場合は Draft PR を使います。

4. **CI とレビューを通す**

   `.github/workflows/ci.yml` が以下を検証します。すべて green であることが必須です。

   - `pnpm format:check` — oxfmt のフォーマットが順守されているか
   - `pnpm lint` — oxlint
   - `pnpm typecheck` — `tsc -b`
   - `pnpm build` — 本番ビルド
   - `pnpm build-storybook` — Storybook のビルド
   - `pnpm test` — Vitest (Storybook のストーリーをブラウザで実行)

5. **`main` へマージする**

   レビュー承認と CI 通過の後にマージします。マージしたらブランチは削除します。

6. **リリースする (配信したいときだけ)**

   **マージしても配信は起きません。** GitHub の Actions から
   `release` を workflow_dispatch で実行します。
   `patch` / `minor` / `major` を選ぶと、直近のタグから次の版を計算して
   GitHub Pages へ配信し、タグと GitHub Release を作ります。
   リリースノートには前回のリリース以降にマージされた PR が並びます。

### ルール

- `main` へ直接 push しない。変更は必ず Pull Request 経由。
- `main` は常にデプロイ可能に保つ。壊れた状態をマージしない。
- PR は 1 つの目的に絞り、レビューしやすいサイズにする。

## 開発環境

### Dev Container (推奨)

Ubuntu ベースの Dev Container を用意しています。Node.js は Dev Container Feature として
インストールされます。

1. [Docker](https://www.docker.com/) と VS Code の
   [Dev Containers 拡張](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   を用意する
2. リポジトリを VS Code で開き、**Reopen in Container** を実行する
3. `postCreateCommand` が pnpm の有効化・依存インストール・husky のフック設定・
   Playwright のブラウザ導入まで自動で行う

含まれるもの:

| 項目           | 内容                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ベースイメージ | `mcr.microsoft.com/devcontainers/base:ubuntu-24.04`                                                                                  |
| Feature        | `node` (LTS) / `github-cli` / `claude-code` / `common-utils`                                                                         |
| 拡張機能       | Oxc (oxlint + oxfmt) / Tailwind CSS IntelliSense / Vitest / Playwright / GitLens / GitHub Pull Requests / Claude Code / EditorConfig |
| ポート転送     | 5173 (Vite) / 6006 (Storybook)                                                                                                       |
| フォーマッタ   | 保存時に oxfmt が実行される (`editor.defaultFormatter` = `oxc.oxc-vscode`)                                                           |

### ホスト設定の引き継ぎ

`claude` と `gh` をコンテナ内でもホストと同じ認証状態で使えるよう、設定ディレクトリを
バインドマウントしています。マウント元は次のように書いており、OS 非依存です。

```
${localEnv:HOME}${localEnv:USERPROFILE}/.claude
```

`HOME` は macOS / Linux でのみ、`USERPROFILE` は Windows でのみ定義されるため、
どちらの OS でも「ホストのホームディレクトリ」に解決されます。

| ホスト設定     | マウント先                | 備考                                                                                                                     |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `~/.claude`    | `/home/vscode/.claude`    | Windows でも `%USERPROFILE%\.claude`。`CLAUDE_CONFIG_DIR` をこのパスに向けているため、設定・認証・履歴がすべて共有される |
| `~/.config/gh` | `/home/vscode/.config/gh` | macOS / Linux / WSL の GitHub CLI 設定                                                                                   |

**マウント元はコンテナ起動前にホスト側に存在している必要があります。**
存在しないと Docker が空ディレクトリを作ってしまうため、事前に作成してください。

```bash
# macOS / Linux / WSL
mkdir -p ~/.claude ~/.config/gh
```

#### Windows ネイティブのホストの場合

GitHub CLI は Windows では `%AppData%\GitHub CLI` に設定を置くため、
`~/.config/gh` のマウントは空になります。次のいずれかで認証してください。

- ホストの環境変数に `GH_TOKEN` を設定する (`gh auth token` の値)。
  `devcontainer.json` の `remoteEnv` でコンテナへ引き継がれます。
- コンテナ内で `gh auth login` を実行する。

### Dev Container を使わない場合

Node.js LTS と pnpm があれば動きます。

```bash
corepack enable
pnpm install
pnpm exec playwright install --with-deps chromium  # pnpm test を実行する場合
pnpm dev
```

## セットリストデータの追加

セットリストの追加・修正はコードを触らずに [`dataset/`](./dataset/) の YAML だけで
行えます。書き方は [dataset/README.md](./dataset/README.md) を参照してください。
データ変更だけの PR も歓迎です。

```bash
pnpm dev   # 編集しながら表示を確認する
```

存在しない曲を参照しているとアプリの起動時にエラーになります。

## UI コンポーネントの確認

Storybook を UI 確認の主経路にしています。新しいコンポーネントには
`*.stories.tsx` を併置してください。

```bash
pnpm storybook   # http://localhost:6006
```
