# ランタイムと道具の版

Node · pnpm · GitHub Actions · Dev Container · Playwright のブラウザの版を保守する。
このリポジトリには `dependabot.yml` が無いので、**これらを上げる PR は誰も作らない。**
同じものを指す箇所を揃えるのと、遅れを拾うのがここでの仕事。

## 1. 集める

SKILL.md §1 の `pins.sh`（どこに何が書いてあるか。食い違いは ⚠）と `pins.sh latest`
（上流の最新版 · サポート期限 · LTS · Dev Container の feature）の出力を使う。

| 対象                     | 書いてある所                                                                         | 上げ方                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Node                     | Dev Container の feature（`"version": "lts"`）· ワークフローの `node-version: lts/*` | 浮いている。新しい LTS が出ると、PR を経ずに CI とコンテナ（作り直したとき）が切り替わる   |
| `@types/node`            | `package.json`                                                                       | いまの LTS と同じ major に揃える（npm の更新として）                                       |
| pnpm                     | `package.json` の `packageManager` の 1 か所                                         | pnpm 自身と `pnpm/action-setup` がここを読む（Node 25 以降は corepack が無い）。手で上げる |
| GitHub Actions           | `uses:` の major タグ（`@v7`）· `runs-on: ubuntu-latest`                             | major の中は浮いている。major は手で上げる                                                 |
| Dev Container の base    | `devcontainer.json` の `image`（`ubuntu-24.04`）                                     | 手で上げる                                                                                 |
| Dev Container の feature | `devcontainer.json`（major まで）· `devcontainer-lock.json`（実際の版と digest）     | `devcontainer upgrade` で lock を進める                                                    |
| Playwright のブラウザ    | `playwright` の版が決める                                                            | `playwright` を上げたら、コンテナで `pnpm exec playwright install --with-deps chromium`    |
| rtk                      | `post-create.sh` が `releases/latest` を取る                                         | 浮いている（開発の補助だけ。配信物に関わらない）                                           |

`pins.sh` の `floating` に出るもの（`lts` · `lts/*` · `ubuntu-latest` · `releases/latest`）と
Actions の major タグは、PR を経ずに中身が変わる。CI が理由なく落ち始めたら、まずここを疑う。
とくに Node の LTS は毎年 10 月ごろに切り替わり、そのときから CI は新しい major で動く。

## 2. 何をするか

| 状況                                                                 | すること                                                                                                                                  |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| ⚠ `@types/node` と実際の Node の major が違う                        | どちらが LTS かを `pins.sh latest` で見る。`@types/node` が遅れていれば上げる PR を出す。コンテナの Node が古いだけならコンテナを作り直す |
| pnpm に同じ major の新しい版がある                                   | 上げる PR を出す（§3）                                                                                                                    |
| pnpm の新しい major がある                                           | §3 の条件を満たせば上げる。満たさなければ報告に条件を書く                                                                                 |
| Actions の major が古い（`pins.sh latest` の ⚠）                     | 上げる PR を出す（§3）                                                                                                                    |
| Dev Container の feature に新しい版がある（`devcontainer outdated`） | lock を進める PR を出す（§3）                                                                                                             |
| `ubuntu-24.04` のサポート期限まで 6 か月を切った                     | base を次の LTS に上げる。条件を満たせないなら、止まってユーザーに知らせる                                                                |

## 3. 上げる

どの更新も [investigation.md](investigation.md) の調査をする（ランタイムの「使用箇所」は
コード全体なので、リリースノートの削除 · 非推奨 · 既定値の変更を grep で潰す）。

- **1 つの対象につき 1 本の PR。書いてある箇所を全部、同じ PR で上げる。**
  終わったら `pins.sh` に ⚠ が無いこと。
- **系統を上げるのは、1 回の保守で 1 対象まで。** 落ちたときに原因を切り分けられなくなる。
- ブランチは `chore/<対象>-<版>`、ワークフローだけなら commit は `ci(deps):`。

| 対象           | 系統を上げてよい条件                                                                                                                                                                                         | ゲート                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `@types/node`  | 同じ major の Node が LTS に入っている（`pins.sh latest` の LTS の日付が過去）                                                                                                                               | `static`                   |
| pnpm           | 公開から 24 時間経っている。major はリリースノートの破壊的変更を読む。上げた後 `pnpm install --frozen-lockfile` が通り、`depdiff.sh lock origin/main` に差が出ない（出たら解決が変わっている。差を調査する） | 全区分                     |
| GitHub Actions | [investigation.md](investigation.md) §5。使っている入力が新しい `action.yml` に残っている                                                                                                                    | `repo` と PR の CI         |
| Dev Container  | コンテナを作り直して `post-create.sh` が最後まで通る                                                                                                                                                         | 作り直したコンテナで全区分 |

pnpm を上げる:

```bash
# package.json の packageManager を書き換えてから（コンテナの中で）
pnpm -v      # packageManager の版へ pnpm が自分で切り替える
pnpm install --frozen-lockfile
```

Dev Container を上げる（ホストで。作り直すとコンテナの中の作業は消える）:

```bash
devcontainer outdated --workspace-folder .
devcontainer upgrade --workspace-folder .                      # lock を進める（major は devcontainer.json を手で）
GH_TOKEN=$(gh auth token) devcontainer up --workspace-folder . --remove-existing-container
devcontainer exec --workspace-folder . .claude/skills/maintenance/scripts/gates.sh
```

`github-cli` の feature は `1.1.2` に固定してある（#67 で固定。理由は commit に書かれていない）。
外すなら、外した状態でコンテナの作成が通ることを確かめてから。

注意:

- **`deploy.yml` と `dependabot-auto-merge.yml` は PR の CI では走らない。**
  これらが使う action を上げたら、差分を読んで確かめるしかない。最初の実行は
  リリース（SKILL.md §6）か、次の Dependabot の PR になる。
- devcontainer の変更は、コンテナを作り直すまで効かない。報告でユーザーに伝える。
- 非推奨の警告は実行結果に出る。`gh run view <id> -R Uno-Takashi/magicalmirai-setlists` の
  ANNOTATIONS を、main の直近の run で見る（Actions の Node の非推奨など）。

## 4. 配信している版

利用者に届いているのは、最後のリリースでビルドした `dist/` だけ。依存の修正も
**リリースしない限り届かない。**

```bash
gh release list -R Uno-Takashi/magicalmirai-setlists --limit 1
curl -fsS https://magicalmirai-setlists.u-not.app/ | grep -oE 'assets/index-[^"]+\.js'
```

前回のリリースより後に、配信物に入る依存（[security.md](security.md) §3）の脆弱性を
直したなら、リポジトリに他の変更が無くてもリリースする理由になる（SKILL.md §6）。
