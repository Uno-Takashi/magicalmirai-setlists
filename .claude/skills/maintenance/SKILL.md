---
name: maintenance
description: Run magicalmirai-setlists' interactive maintenance cycle - review and merge the open Dependabot PRs (adding migration code where needed), create and merge pending security updates, keep runtime and tool versions current (Node, pnpm, GitHub Actions, Dev Container features), then cut a patch release to GitHub Pages. Use when asked to do maintenance, take in security updates, or do upkeep and release.
---

# Maintenance (magicalmirai-setlists)

依存更新 · セキュリティ修正 · ランタイムと道具の版を取り込み、リリース（GitHub Pages への配信）まで通す。
順番は固定。

| §   | 段階                     | 手順の在りか（その段階に入ってから読む） |
| --- | ------------------------ | ---------------------------------------- |
| 0   | 準備と control           | —                                        |
| 1   | 棚卸し                   | —                                        |
| 2   | Dependabot PR            | [investigation.md](investigation.md)     |
| 3   | 保留中のセキュリティ更新 | [security.md](security.md)               |
| 4   | ランタイムと道具の版     | [toolchain.md](toolchain.md)             |
| 5   | リリース前の最終確認     | —                                        |
| 6   | リリース                 | —                                        |
| 7   | 報告と後片付け           | —                                        |

リポジトリは `Uno-Takashi/magicalmirai-setlists`（以下 `gh` には `-R` で必ず渡す）。

スクリプト（`.claude/skills/maintenance/scripts/`。以下 `scripts/`）:

| スクリプト             | 用途                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `gates.sh [区分...]`   | CI と同じ検査に、成果物の検査と実ブラウザの確認を足して回し、表を出す。区分は `static test dist smoke repo` |
| `depdiff.sh lock\|npm` | ロックファイルの解決結果の差 · npm に公開された配布物同士の差                                               |
| `pins.sh [latest]`     | ランタイムと道具の版がどこに書いてあるか · 上流の最新とサポート期限                                         |

`gates.sh` は `check-dist.mjs`（成果物の検査）と `smoke.mjs`（vite preview を起動し、
sitemap の全ページを Chromium で開く）を呼ぶ。

## このリポジトリの前提

- **配信物は静的なファイルだけ。** サーバは持たない。利用者に届くのは `pnpm build` が
  作る `dist/`（バンドルされた JS · CSS と、ページごとの HTML）で、GitHub Pages が配る。
- **`main` にマージしても配信されない。** 配信は `release` ワークフロー
  （`.github/workflows/deploy.yml`）を手で起動したときだけ。依存の修正も、
  リリースするまで利用者には届かない。
- **`dependabot.yml` は置いていない。** Dependabot が開く PR はセキュリティアップデートだけ。
  そのうち patch は `dependabot-auto-merge.yml` が CI の通過を待って自動でマージする
  （`--merge`）。minor / major は人（この skill）が見る。GitHub Actions · Node · pnpm ·
  Dev Container の版を上げる PR は誰も作らない（§4 で拾う）。
- 自分で出す PR は squash でマージする（`--squash`）。マージしたブランチは GitHub が消す。

## どこで回すか

**検査は Dev Container の中で回す。** Storybook のテストと `smoke` は Playwright の Chromium と
その OS ライブラリを使い、`post-create.sh` がそれを入れている。CI（`ubuntu-latest`）に近いのもこちら。

- セッションがコンテナの中なら、そのまま回す。
- セッションがホストなら、ホストで `devcontainer` CLI を使う。`gh` と `git push` はホストで回してよい。

  ```bash
  GH_TOKEN=$(gh auth token) devcontainer up --workspace-folder .        # 起動（初回は数分）
  devcontainer exec --workspace-folder . <コマンド>                     # 中で回す
  ```

  `devcontainer exec` の作業ディレクトリはリポジトリのルート。`<W>`（下記）は
  リポジトリの外なのでコンテナから見えない。コンテナで回す検査のログは
  `GATES_LOG_DIR=.maintenance/<名前>` のようにリポジトリの下へ書く（`.maintenance/` は
  `.git/info/exclude` に足して追跡から外す）。

コンテナとホストは同じ作業ツリーを共有する。`node_modules` はコンテナの中で作り直されるので、
ホストで `pnpm` を回さない（store のパスが食い違い、作り直しになる）。

## 約束

- **CI が緑でも、取り込む根拠にはならない。** 更新ごとに [investigation.md](investigation.md) の
  調査をし、根拠を残してからマージする。
- **main を壊れた状態にしない。** 移行コードは bump と同じ PR に載せる。
- **リリースは本番への配信。** 配信は数分で利用者に届く。§5 を通さずにリリースしない。

やらないこと（必要に見えたら、理由を示してユーザーに聞く）:

- 公開から 24 時間経っていない版 · プレリリース版を入れる
- 脆弱性アラートを dismiss する。Dependabot の PR を閉じる
- 依存の install スクリプトを許す（`pnpm approve-builds` · `onlyBuiltDependencies` に足す）
- `dependabot-auto-merge.yml` の条件を緩める
- version を手で書き換える。タグ · リリースを手で作る。main へ直接 push する

止まってユーザーに聞くとき:

- §0 の control が赤い
- ゲートが落ち、どの更新が原因か切り分けられない
- 配信物に入る high / critical の脆弱性に修正版が無い
- 供給元に不審な点がある（公開者の交代 · provenance の消失 · install スクリプトの追加）
- `release` ワークフローが途中で落ちた

## 出力を絞る

長い出力を会話に流さない。安全のための手順は省かず、**読む量**を減らす。

- `gates.sh` は表だけを読む。落ちた検査は末尾が自動で出る。足りなければログを `grep` する。
- PR の本文 · リリースノート · 差分は、`<W>`（§0）のファイルへ落としてから
  `grep` か行の範囲で読む（`gh pr view <N> -R Uno-Takashi/magicalmirai-setlists --json body -q .body > <file>`）。
- `gh` は `--json <列>` と `-q` で要る列だけを取る。
- 差分は一覧（`--stat`）を先に見て、使用箇所に関わるファイルだけを開く。
- CI の待ちは出力を捨てて結果だけ取る:
  `gh pr checks <N> -R Uno-Takashi/magicalmirai-setlists --watch >/dev/null 2>&1; gh pr checks <N> -R Uno-Takashi/magicalmirai-setlists`
- 同じパッケージが複数の PR に出たら、調査は 1 回にして記録を使い回す。
- 差分の大きい更新（React · Vite · HeroUI · Storybook の major など）の調査は、サブエージェントに
  [investigation.md](investigation.md) を渡して任せ、その「判定と記録」の記録だけを受け取ってよい。
  記録に「探した語と範囲」が無い項目は根拠として扱わず、自分で確かめる。

## 0. 準備と control

対話セッションで実行する。`gh` に `repo` と `workflow` のスコープが要る（`gh auth status`）。
作業用ディレクトリ（以下 `<W>`）を scratchpad の下に 1 つ作る。シェル変数は Bash の呼び出しを
またいで残らないので、後で使う値は `<W>` のファイルに置く。

```bash
git status --porcelain            # 追跡中のファイルに未コミットの変更があれば、止めて聞く
git branch --show-current > <W>/orig      # 空（detached）なら git rev-parse HEAD を入れる
git fetch --prune --tags origin
git switch --detach origin/main
git rev-parse HEAD > <W>/start-sha && date -u +%Y-%m-%dT%H:%M:%SZ > <W>/started
grep -qx '/.maintenance/' .git/info/exclude || echo '/.maintenance/' >> .git/info/exclude
# コンテナの中で（ホストからなら devcontainer exec --workspace-folder . を前に付ける）
GATES_LOG_DIR=.maintenance/control .claude/skills/maintenance/scripts/gates.sh   # 全区分。約 1〜2 分
```

この結果が control（落ちた検査が更新のせいか、元からかを切り分ける基準）。
依存の取得が遅いと延びるので、`timeout` は長め（600000）にして回す。

- FAIL があれば取り込みを始めない。直す PR を先に出すか、ユーザーに聞く。
- PR のブランチは、`origin/main` へ merge か rebase した状態で検証する
  （確かめたいのは main に入った後の状態で、スクリプトも main にある）。

## 1. 棚卸し

```bash
gh pr list -R Uno-Takashi/magicalmirai-setlists --author "app/dependabot" --state open \
  --json number,title,headRefName,mergeStateStatus \
  -q '.[] | [.number, .mergeStateStatus, .title] | @tsv'

LATEST=$(git tag --list 'v*.*.*' | sort -V | tail -n1)
git log --no-merges --format='%h %s' "${LATEST}..origin/main"

.claude/skills/maintenance/scripts/pins.sh          # コンテナの中で（node · pnpm の実際の版を見る）
.claude/skills/maintenance/scripts/pins.sh latest   # ホストで（gh と devcontainer CLI を使う）
```

脆弱性は [security.md](security.md) の「洗い出す」で集める。

1 枚の表にまとめてユーザーに見せ、そのまま進む（承認は待たない）: 扱う PR ·
脆弱性ごとの対処（既存の PR で直る / PR を作る / 直せない）· 上げる版 ·
未リリースの commit に `feat` や破壊的変更があるか。

## ゲートの回し方

| 場面                                                         | 区分                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| control（§0）· 束ねた最終状態（§2）· リリース前（§5）        | 全区分                                                         |
| `dependencies` の更新（配信物に入りうる）                    | `static test dist smoke`                                       |
| ビルドの道具（vite · rolldown · tailwind · TypeScript など） | `static test dist smoke`                                       |
| テストの道具だけ（storybook · vitest · playwright）          | `static test`                                                  |
| oxlint · oxfmt                                               | `static`                                                       |
| ワークフロー                                                 | `repo` と PR の CI                                             |
| Dev Container                                                | コンテナを作り直してから全区分（[toolchain.md](toolchain.md)） |

- 個々の PR は、上の区分と **PR の CI がすべて緑**であることで判断する。
- `SKIP` は通ったことにならない（道具が無くて回せなかった検査）。CI の結果で補う。
  `repo` は CI に無いので、SKIP なら差分を読んで補う。
- `dist` と `smoke` は同じ実行で作った `dist/` を見る（単独で指定すると build から回す）。
- `dist` は成果物の sha256 を `dist.sha256` に残す。control と比べれば、更新が
  利用者に届く中身を変えたかが分かる。

## 2. Dependabot PR

### 調べる

PR ごとに次を見る。

```bash
gh pr view <N> -R Uno-Takashi/magicalmirai-setlists --json number,title,headRefName,headRefOid,statusCheckRollup,files
gh pr view <N> -R Uno-Takashi/magicalmirai-setlists --json body -q .body > <W>/pr-<N>.md   # アドバイザリと commit 一覧
```

- 調査は [investigation.md](investigation.md) の全項目。リリースノートだけで済ませない。
  Dependabot の本文は commit 一覧だけのことがあるので、一次情報（GitHub Releases ·
  CHANGELOG · 移行ガイド）を取りに行く。**現在 → 目標の間の版を全部**読む。
- CI が赤い PR は、落ちたジョブのログが一番の手掛かり
  （`gh run view <id> -R Uno-Takashi/magicalmirai-setlists --log-failed > <W>/run-<id>.log`）。
- patch の PR は `dependabot-auto-merge` が既に動いている。CI が通れば自動でマージされる。
  `gh run list -R Uno-Takashi/magicalmirai-setlists --workflow dependabot-auto-merge.yml --limit 10 --json headBranch,status,conclusion`
  で状態を見る。自動マージで入ったものも、調査はする（記録を報告に入れる）。
- **マージは調査した commit に縛る。** 調査のときに head を控え、マージで照合する。

  ```bash
  gh pr view <N> -R Uno-Takashi/magicalmirai-setlists --json headRefOid -q .headRefOid > <W>/pr-<N>.sha
  ```

  rebase · recreate · push で head が変わったら、`depdiff.sh lock` をやり直して調査した内容と
  同じであることを確かめ（版が変わっていたら調査し直す）、控えを更新する。

### 束ねて検証する

CI は **PR 単体**しか見ていない。全 PR を入れた最終状態を作り、**マージの前に**全区分を通す。

```bash
git switch -c maint/verify origin/main
git merge --no-edit origin/<PR のブランチ>        # PR ごとに
# ロックファイルが衝突したら: package.json を最終形にし、pnpm-lock.yaml は origin/main の側を取って
#   pnpm install --no-frozen-lockfile（コンテナの中で）で解き直してから commit する
GATES_LOG_DIR=.maintenance/final .claude/skills/maintenance/scripts/gates.sh
git rev-parse 'HEAD^{tree}' > <W>/final-tree      # 通ったら
.claude/skills/maintenance/scripts/depdiff.sh lock origin/main HEAD > <W>/final-lock.txt
```

落ちたら、control と比べて原因の PR を外し、残りで回し直す。

### マージする

順番: 脆弱性の深刻度が高いもの → `dependencies` → `devDependencies`。major は最後。
ロックファイルは 1 本なので、1 つマージすると残りが衝突しやすい。**1 本ずつ**:

1. 最新の head で PR の CI がすべて緑であることを確かめる
2. マージする（Dependabot の PR は自動マージと同じ `--merge`）

   ```bash
   gh pr merge <N> -R Uno-Takashi/magicalmirai-setlists --merge --match-head-commit "$(cat <W>/pr-<N>.sha)"
   ```

3. 残りの PR が `DIRTY` になったら `gh pr comment <M> -R Uno-Takashi/magicalmirai-setlists --body "@dependabot rebase"`。
   `mergeStateStatus` が `CLEAN` に戻り、新しい head の CI が緑になるまで待ち、
   `depdiff.sh lock` で解決結果が調査したものと同じことを確かめてから次へ

### そのままでは取り込めない PR

閉じずに、必要な変更を**同じ PR に**足す（Dependabot のブランチへ push する）。
push 後の commit で PR の CI が緑になってからマージする。

```bash
git switch -c fix-<pkg> origin/<PR のブランチ>
git rebase origin/main             # 衝突は package.json を最終形にして pnpm install で lock を作り直す
# 移行コードを当てる。bump の commit と分ける（Dependabot の commit を書き換えない）
git push --force-with-lease origin HEAD:<PR のブランチ>
```

push すると Dependabot はその PR を更新しなくなる。patch の PR なら、push の後も
`dependabot-auto-merge` が CI の通過を待って自動でマージしうる（push した commit の CI が
緑になるまで、この skill の検証を終えておく）。

| 状況                                              | 対処                                                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| ロックファイルが衝突している                      | `@dependabot rebase`。動かなければ `@dependabot recreate`。自分で push した PR には使わず（足した commit が消える）、上の手順で rebase する |
| 破壊的変更で CI が赤い                            | 移行コードを足す。bump の commit と分ける                                                                                                   |
| 相方の依存も上げないと peer dependency が合わない | 同じ PR で一緒に上げる（相方も調査する。`@storybook/*` · `@heroui/*` · `@nivo/*` · `@vitest/*` · `@react-aria/*` は揃えて上げる）           |
| ランタイムの下限が上がる                          | [toolchain.md](toolchain.md) の手順で版を揃える。CI の Node が足りなければ見送る                                                            |
| 上流のバグで直しようがない                        | 見送る。調べた内容を PR にコメントし、開いたままにする                                                                                      |

## 3. 保留中のセキュリティ更新

[security.md](security.md) の手順。§2 のマージが終わってから始める
（Dependabot PR で直ったものを二重に直さない）。
**1 パッケージにつき 1 本の PR、1 本ずつ直列**（束ねると、落ちたときに原因が分からない）。

## 4. ランタイムと道具の版

[toolchain.md](toolchain.md) の手順。§1 の `pins.sh` で見つけた食い違いと遅れを片付ける。

## 5. リリース前の最終確認

```bash
git fetch origin && git switch --detach origin/main
GATES_LOG_DIR=.maintenance/release .claude/skills/maintenance/scripts/gates.sh   # コンテナの中で
```

`git rev-parse 'origin/main^{tree}'` が `<W>/final-tree`（§2 で束ねた最終状態）と同じなら、
回し直さずにその結果を使ってよい（`dist/` は作り直す: `gates.sh dist smoke`）。
確かめた commit を控える: `git rev-parse origin/main > <W>/verified-sha`

リリースしてよい条件（すべて）:

1. 全区分が PASS。`SKIP` の検査は CI の結果で補えている
2. §0 以降に main で走った CI がすべて完了し、最新が成功している

   ```bash
   gh run list -R Uno-Takashi/magicalmirai-setlists --branch main --event push --created ">=$(cat <W>/started)" --limit 50 \
     --json workflowName,status,conclusion,headSha \
     -q '.[] | [.workflowName, .status, .conclusion, .headSha[0:8]] | @tsv'
   ```

3. [security.md](security.md) の「洗い出す」をやり直し、残った脆弱性がすべて理由付きで説明できる
4. `pins.sh` に説明できない ⚠ が無い
5. 配信物の差が説明できる

   ```bash
   diff .maintenance/control/dist.sha256 .maintenance/release/dist.sha256 | grep '^[<>]' | awk '{ print $1, $3 }'
   ```

   差が無ければ、利用者に届く中身は変わっていない。差があれば、今回取り込んだどの更新に
   よるものか（`dist/assets/*.js` のハッシュは中身が 1 バイト変わっても変わる）を言えること。
   ページの HTML（`*.html` · `sitemap.xml`）が変わったなら、dataset か `build/` の変更で
   説明が付くこと。言えない差があれば止まる。

## 6. リリース

リリースするのは、前回タグから配信物に効く変更があるとき:

```bash
git diff --quiet "$(git tag --list 'v*.*.*' | sort -V | tail -n1)" origin/main -- \
  src dataset public index.html build vite.config.ts .env package.json pnpm-lock.yaml tsconfig.app.json \
  || echo "配信物に効く変更あり"
```

無くても、配信物に入る依存（[security.md](security.md) §3 の「配信物」）の脆弱性を
今回直したなら、それは前回の配信物に残っているのでリリースする。どちらでもなければしない。

| 入力   | 値          |
| ------ | ----------- |
| `bump` | **`patch`** |

聞かずに決めてよい。次に当たるときだけ、`AskUserQuestion` で選択肢を出して聞く。

| 条件                                                         | 聞くこと                                 |
| ------------------------------------------------------------ | ---------------------------------------- |
| 未リリースの commit に `feat` がある                         | patch のままか、minor にするか           |
| `!:` か `BREAKING CHANGE` がある                             | リリースするか。するなら種別             |
| 今回の保守より前にマージされた、まだ配信していない変更がある | 一緒に配信してよいか（下の一覧を見せる） |

```bash
git log --no-merges --format='%h %s' "<前回タグ>..$(cat <W>/start-sha)" -- src dataset public index.html build vite.config.ts .env
```

**起動の直前に確かめる。** `release` は起動した時点の main をビルドしてタグを打つ。
Dependabot の自動マージは保守の最中にも main を進める。

```bash
git fetch origin && [ "$(git rev-parse origin/main)" = "$(cat <W>/verified-sha)" ] && echo same
for w in deploy.yml dependabot-auto-merge.yml; do    # 0 が 2 行出ること
  gh run list -R Uno-Takashi/magicalmirai-setlists --workflow "$w" --limit 10 --json status -q '[.[] | select(.status != "completed")] | length'
done
```

main が動いていたら §5 からやり直す。どちらかが実行中なら、終わるのを待って §5 からやり直す。

起動する:

```bash
gh workflow run deploy.yml -R Uno-Takashi/magicalmirai-setlists --ref main -f bump=patch
# 数秒待ってから、いま起動した run を取る（headSha が verified-sha であること）
gh run list -R Uno-Takashi/magicalmirai-setlists --workflow deploy.yml --limit 1 \
  --json databaseId,headSha,status -q '.[0] | [.databaseId, .headSha, .status] | @tsv'
```

run の id は `<W>/release-run` に置き、`gh run watch` ではなく
`gh run view <id> -R Uno-Takashi/magicalmirai-setlists --json status,conclusion,jobs -q '.status, .conclusion, (.jobs[] | [.name, .conclusion] | @tsv)'`
を 1〜2 分おきに見る（全体で数分）。

完了の確認:

- ジョブ `version` · `build` · `deploy` · `release` がすべて success
- リリースとタグができ、タグが確かめた commit を指す

  ```bash
  gh release view -R Uno-Takashi/magicalmirai-setlists --json tagName,url -q '[.tagName, .url] | @tsv'
  git fetch --tags origin && git rev-parse '<タグ>^{commit}'      # <W>/verified-sha と同じ
  ```

- 本番が新しい版に入れ替わった。`index.html` が参照する JS は内容のハッシュで名前が付くので、
  §5 で同じ commit から作った `dist/index.html` と同じ名前なら入れ替わっている
  （Pages の CDN は最大 10 分ほど古いものを返す。違えば数分おいて取り直す）

  ```bash
  curl -fsS https://magicalmirai-setlists.u-not.app/ | grep -oE 'assets/index-[^"]+\.js'
  grep -oE 'assets/index-[^"]+\.js' dist/index.html
  for p in / /statics /sitemap.xml /robots.txt; do
    curl -s -o /dev/null -m 20 -w "$p %{http_code}\n" "https://magicalmirai-setlists.u-not.app$p"
  done
  ```

  名前が一致しなければ、手元とビルド環境（CI の Node は `lts/*`）の違いでも起きうる。
  そのときは `index-*.js` を取ってきて開き、描画されることを確かめる
  （`SMOKE_PORT` を使った確認は手元のビルドにしか使えない）。応答しなければすぐユーザーに知らせる。

`release` が途中で落ちたら、どのジョブかで扱いが違う。`version` か `build` なら何も配信されて
いないので、原因を直してから起動し直す。`deploy` 以降なら配信は済んでいるかもしれない
（`release` ジョブはタグが既にあれば何もしない）。どちらもユーザーに知らせる。

## 7. 報告と後片付け

報告（更新ごとの記録は [investigation.md](investigation.md) の「判定と記録」の形）:

- 取り込んだもの（自動マージで入ったものも）· 手を入れた PR（足した変更と理由）·
  見送ったもの（次に何が起きれば取り込めるか）
- 脆弱性: 直したもの / 残ったもの（深刻度 · 配信物に入るか · 直せない理由）/
  GitHub のアラートと監査の食い違い
- 版: 上げたもの · 揃えたもの · 期限が近いもの
- 挙動が変わるが壊れてはいない点（要フォローアップ）
- リリース: 版 · run の URL · 本番が入れ替わったか
- ゲート: control と最終の表。`SKIP` だった検査

後片付け:

```bash
git switch "$(cat <W>/orig)"      # commit を控えていたなら --detach
git branch -D maint/verify <ほかに検証用に作ったブランチ>
pnpm install --frozen-lockfile    # コンテナの中で。依存を元のブランチの状態へ
git status --porcelain            # 何も出ないこと
```

`.maintenance/` · `<W>` · `/tmp/depdiff-*` を消す。コンテナは止めなくてよい（ユーザーが開発に使う）。
