# 更新を取り込んでよいか調べる

Dependabot の PR でも、自分で作るセキュリティ更新でも、**マージの前に 1 つずつ**行う。
答えるべき問いは 4 つ。

1. 実際には何が変わるか（PR のタイトルではなく、解決結果）
2. このリポジトリは、それをどこでどう使っているか
3. ライブラリの側で何が変わったか（リリースノートと、差分そのもの）
4. その版は、信頼できる供給元から出た普通の版か

最後に「使っている箇所」と「変わった箇所」を突き合わせ、判定と根拠を残す。

## 深さの決め方

| 対象                                                                                             | 読む深さ                                                                       |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| 配信物に入る直接依存（React · HeroUI · react-aria · motion · gsap · @nivo · react-icons · yaml） | §1〜§7 のすべて。差分は使っている API の実装まで読む                           |
| ビルドの道具（vite · rolldown · @vitejs/plugin-react · tailwindcss · TypeScript）                | §1〜§6。差分は設定の読み方と出力に関わる所を読む。`dist.sha256` の差を重く見る |
| 検査の道具（storybook · vitest · playwright · zod · oxlint · oxfmt · husky · lint-staged）       | §1〜§5。ゲートの結果を重く見る                                                 |
| 推移的依存                                                                                       | §1 · §2（誰が引き込み、配信物に入るか）· §3 の配布物の差 · §4                  |
| 脆弱性の修正版                                                                                   | 上に加えて、修正の commit を特定し、それ以外に何が入ったかを見る               |

patch 更新でも省かない。破壊的変更は patch にも入るし、乗っ取られた版は patch として出る。

## 1. 何が変わるか

PR が触るのは `package.json` の 1 行でも、ロックファイルでは推移的依存がまとめて動く。

```bash
# PR。base は分岐点にする（origin/main だと、main 側の進みが逆向きの差として混ざる）
.claude/skills/maintenance/scripts/depdiff.sh lock "$(git merge-base origin/main origin/<PR のブランチ>)" origin/<PR のブランチ>
.claude/skills/maintenance/scripts/depdiff.sh lock origin/main      # origin/main から切った作業ツリーと比べる
```

- 出てきた行が調査の対象。タイトルに無いパッケージが動いていたら、それも調べる。
- `(なし) -> x.y.z` は新しく入る依存。§4 を必ず行う。
- 同じ名前に版が 2 つ並んだら（`3.51.0 -> 3.51.0, 3.53.1`）、重複して入っている。
  どちらを誰が使うかを §2 で確かめる。react-aria · @internationalized/* のように
  配信物に入るものの重複は、バンドルが太り、文脈（context）が分かれて壊れることがある。
- major を跨ぐものと、0.x の minor（0.x は minor が破壊的変更。`@nivo/*` · `oxfmt` が該当）に印を付ける。
- 「設定」の差（`overrides` など）が出たら、誰がなぜ変えたかを確かめる。

## 2. どこでどう使っているか

### 誰が引き込んでいて、配信物に入るか

```bash
pnpm why <pkg>              # どの依存から来るか
pnpm why <pkg> --prod       # 何も出なければ devDependencies からしか来ない
```

| 届く先                     | 見分け方                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 配信物（利用者のブラウザ） | `dependencies` から辿れ、かつ `src/` から import されている（Vite が同梱する）                              |
| ビルドの出力を作るもの     | vite · rolldown · plugin-react · tailwindcss · TypeScript · `build/` と `vite.config.ts` が import するもの |
| 開発機と CI だけ           | `devDependencies` からしか辿れず、ビルドの出力に関わらない                                                  |

`dependencies` にあっても配信物に入るとは限らない（使われない部分は tree-shaking で落ちる）。
逆に `yaml` は dataset をブラウザで解釈するために配信物に入る。

開発用でも無関係ではない。ビルドの道具は配信物を作るので、乗っ取られれば配信物が汚れる。
Vite の dev サーバは `host: true` ですべてのアドレスで待ち受けるので、dev サーバの脆弱性は
同じネットワークから届く。

### 使っている箇所を洗い出す

import だけを探さない。設定ファイルや文字列で参照していることがある。

```bash
# import / require / 動的 import
grep -rnE "from ['\"]<pkg>(/[^'\"]*)?['\"]|require\(['\"]<pkg>|import\(['\"]<pkg>" \
  src build .storybook vite.config.ts

# 設定・スクリプト・CSS（--include は名指しのファイルにも効くので、2 つに分ける）
grep -rn "<pkg>" --include='*.config.*' --include='*.css' --include='*.json' . \
  | grep -vE 'node_modules|pnpm-lock|/dist/|storybook-static'
grep -rn "<pkg>" .storybook index.html components.json .github .devcontainer
```

`src/index.css` は `tailwindcss` → `@heroui/styles` を `@import` している（CSS から使う依存は
import の grep に出ない）。`.storybook/main.ts` の `addons` は文字列で参照している。

洗い出したら、**呼んでいる API を列挙する**（関数 · コンポーネント · props · フック ·
設定キー · CLI のフラグ · 頼っている既定値）。§3 で読む場所がこれで決まる。

- 明示していない props · 引数は、既定値に頼っている。既定値の変更はここに効く。
- 型だけ使っている（`import type`）なら、影響は typecheck で分かる。
- 推移的依存は、引き込んでいる親が何のために使っているかを見る（§3 の親の差分で分かる）。

### 壊れたときに気付きにくい所

次に関わる依存は、ゲートが緑でも壊れうる。該当したら実際に動かして確かめる
（`gates.sh smoke` · `pnpm dev` を Chromium で開く）。

- **dataset の読み込み**（`yaml` · Vite の `import.meta.glob`）— 壊れるとビルドは通って
  画面が真っ白になる。`test:dataset` と `smoke` が拾う
- **ページごとの HTML と sitemap**（`vite.config.ts` のプラグイン · `build/`）— Vite の
  プラグイン API（`generateBundle` · `closeBundle` · `emitFile`）の変更。`dist` が拾う
- **アニメーション**（motion · gsap · React Bits）— 例外は出ずに動きだけ変わる。
  Storybook で該当のストーリーを開いて見る
- **アクセシビリティ**（react-aria · HeroUI）— 読み上げ名とキーボード操作。Storybook の a11y アドオン
  （`pnpm test` のストーリーで走る）と、CLAUDE.md の「アクセシビリティ」の確認方法

## 3. ライブラリの側で何が変わったか

### リリースノート

現在の版から目標の版まで、**間の版を全部**読む。取得先は GitHub Releases、無ければ
`raw.githubusercontent.com/<org>/<repo>/main/CHANGELOG.md`、または公式の移行ガイド
（Vite: `https://vite.dev/guide/migration` · Storybook: `https://storybook.js.org/docs/releases/migration-guide` ·
HeroUI: `https://www.heroui.com/docs`）。
「Breaking」「Deprecated」「Removed」「Changed」「Security」と、既定値の変更を拾う。
リリースノートは書き漏らす。ここで終わりにしない。

### ソースの差分

```bash
# リポジトリを特定する
npm view <pkg> repository.url

# タグの付け方はまちまち（v1.2.3 · 1.2.3 · <pkg>@1.2.3）
gh api "repos/<owner>/<repo>/tags" --paginate -q '.[].name' | grep -F '<版>'

# 変わったファイルと commit
gh api "repos/<owner>/<repo>/compare/<旧タグ>...<新タグ>" \
  -q '"commits: \(.total_commits)", (.files[] | "\(.status)\t+\(.additions) -\(.deletions)\t\(.filename)")'
gh api "repos/<owner>/<repo>/compare/<旧タグ>...<新タグ>" -q '.commits[] | "\(.sha[0:8]) \(.commit.message | split("\n")[0])"'

# 特定のファイルの差分
gh api "repos/<owner>/<repo>/compare/<旧タグ>...<新タグ>" -q '.files[] | select(.filename == "<path>") | .patch'
```

ファイルが 300 を超える比較は一覧が切れる。monorepo（storybook · react-spectrum · nivo）は
特にそうなので、commit の一覧から当たりを付けるか、配布物の差を使う。

### 配布物の差分

実際にインストールされるのはリポジトリではなく、レジストリに公開された配布物。
ビルド済みの出力が入っていて、リポジトリと一致するとは限らない。

```bash
.claude/skills/maintenance/scripts/depdiff.sh npm <pkg> <旧> <新>

# 続きは展開先を直接比べる（展開したものは実行しない）
git diff --no-index <旧の展開先>/<path> <新の展開先>/<path>
```

### 何を読むか

§2 で列挙した API を起点に読む。

- **使っている関数・コンポーネントの実装**: シグネチャ · props と引数の既定値 · 返り値の形 ·
  投げる例外 · 同期か非同期か
- **型定義**（`.d.ts`）: 圧縮された JS しか無いときは、型の差が API の差を表す
- **入口**: `package.json` の `exports` · `main` · `module` · `type` · `sideEffects`。
  ここが変わると import が解決できなくなるか、バンドルに入る範囲が変わる
- **要求**: `engines` · peer dependency。§5 と突き合わせる
- **依存の増減**: 増えた依存は、それ自体を §4 で調べる
- **設定の読み方**: 設定キーの改名 · 既定値 · 環境変数（Vite の `VITE_*` の扱い · `base`）
- **脆弱性の修正**: アドバイザリが指す修正 commit を見つけ、修正の中身と、
  その版に修正以外の変更が入っているかを確かめる

差分が大きくて読み切れないときは、読めた範囲と読めなかった範囲を記録に書く。
「全部読んだ」ことにしない。

## 4. 供給元

`depdiff.sh npm` の「公開情報」と「package.json の差」を見る。

| 見る点             | 判断                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| 公開日時           | 24 時間以内なら待つ（このリポジトリは `minimumReleaseAge` を設定していないので、ここで止める）                 |
| 公開者             | 前の版と違えば、リポジトリの履歴でメンテナの交代を確かめる。説明が付かなければ止める                           |
| provenance         | 「あり → なし」になったら止める（CI から出ていた版が手元から出された）                                         |
| install スクリプト | 増えた・変わったら中身を読む。pnpm は依存の install スクリプトを既定で走らせない。許可を勝手に足さない         |
| 新しい依存         | 名前（似せた名前でないか）· 公開日 · 公開者 · リポジトリを見る                                                 |
| タグとの対応       | 配布物にだけあってリポジトリに無いコードは、ビルド出力として説明が付くか                                       |
| ライセンス         | 変わったら確かめる。配信物に入るものが copyleft（GPL · AGPL · LGPL など）になったら止める。サイトは MIT で配る |
| 取り下げ           | npm で `deprecated` が付いた版は入れない                                                                       |

差分の中で、次が**新しく現れたら**理由を確かめる: ネットワークへの接続 · 環境変数や
認証情報の読み取り · ファイルの書き込み · 子プロセスの起動 · `eval` / 動的なコード生成 ·
読めないように詰められた文字列。説明が付かなければ取り込まず、ユーザーに知らせる。
配信物に入る依存なら、`document.cookie` · `localStorage` · 外部への `fetch` · スクリプトの
差し込みも同じ扱い（利用者のブラウザで動く）。

## 5. ランタイムと周辺の下限

更新が要求する下限（`engines` · peer dependency）を、実際に動かしている版と突き合わせる。
実際の版は `scripts/pins.sh` が一覧にする。

- **Node**: CI と Dev Container は `lts/*` · `lts` で浮いている。`engines.node` が
  いまの LTS を許すか。足りなければ [toolchain.md](toolchain.md) の手順で揃えるか、見送る
- **ブラウザ**: 配信物の対応ブラウザは Vite の `build.target` の既定（baseline）で決まる。
  Vite の major や依存の更新で、古いブラウザで動かない構文が入ることがある
- **peer dependency**: `pnpm install` の警告（`unmet peer`）をゲートのログで見る
  （`grep -n 'peer' <ログの install>`）

ecosystem ごとの注意:

- **github-actions**: action の major は入力名と既定値、要求するランナーの Node を見る。
  使っている入力が新しい `action.yml` に残っていることを確かめる
  （PR の CI で走らないワークフローの扱いは [toolchain.md](toolchain.md)）。

## 6. テストはその経路を通っているか

ゲートが通っても、その依存を通る経路が実行されていなければ何も確かめていない。

- **単体テスト**（`test:unit`）はドメイン層とユースケースだけ。React も dataset も通らない
- **dataset の検証**（`test:dataset`）は実データの読み込み経路を通る
- **Storybook のテスト**（`pnpm test`）は作り物のカタログで部品を描く。ストーリーがある
  部品だけが対象。§2 で洗い出したファイルに `*.stories.tsx` があるかを見る
- **smoke** は実データで sitemap の全ページを開く。ページの例外と console.error を拾うが、
  見た目とアニメーションは確かめない
- **見た目**: 使っている部品のストーリーを Storybook で開くか、`pnpm dev` を Chromium で撮って
  更新の前後で比べる（`pnpm exec playwright screenshot --viewport-size=1280,800 <URL> <file>.png`）。
  挙動が変わりうる更新（§3 で「既定値が変わる」「見た目が変わる」と読んだもの）では行う

## 7. 判定と記録

| 判定         | 意味                                                                   | 次                                           |
| ------------ | ---------------------------------------------------------------------- | -------------------------------------------- |
| 安全         | 変わった箇所を使っていない、または使い方に影響しないと根拠付きで言える | ゲートを通してマージ                         |
| 移行が要る   | 使っている API が変わった                                              | 移行コードを同じ PR に足す（SKILL.md §2）    |
| 挙動が変わる | 壊れないが、利用者から見える挙動が変わる                               | マージしてよいかを判断し、報告に別立てで書く |
| 見送り       | 下限が足りない · 供給元に疑問 · 直しようがない                         | PR にコメントして開いたままにする            |

更新ごとに次を残す（PR のコメントか、最後の報告に入れる）:

```
<pkg> <旧> -> <新>（直接 / 推移的 · 配信物 / ビルド / 開発用）
変わるもの   : ロックファイル上の差（一緒に動いた依存を含む）
使用箇所     : ファイルと、使っている API
読んだもの   : リリースノート（版の範囲）· 比較した差分（ファイル名）· 読めなかった範囲
突き合わせ   : 変更点ごとに「該当なし（理由）」か「該当（対処）」
供給元       : 公開日時 · 公開者 · provenance · install スクリプト · ライセンス
検証         : 回したゲートと結果 · テストがその経路を通っているか · dist.sha256 の差
判定         : 安全 / 移行が要る / 挙動が変わる / 見送り
```

「該当なし」は、探した語と探した範囲を添えて初めて根拠になる。
