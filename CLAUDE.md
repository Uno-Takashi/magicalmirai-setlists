# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドです。

## プロジェクト概要

初音ミク「マジカルミライ」歴代公演のセットリストを閲覧するファンページ。
完全に static な SPA として GitHub Pages で配信する。バックエンドは持たない。

- 公開先: https://uno-takashi.github.io/setlist/
- 公式サイト (一次情報源): https://magicalmirai.com/

---

# ドメイン知識

コードを読む前にここを読むこと。**ドメインの語彙とルールがそのまま
`src/domain/` のモジュール構成になっている。**

## ボーカロイド

ボーカロイドは、ヤマハが開発した歌声合成技術「VOCALOID」およびそれを用いた
ソフトウェア・楽曲・文化全体の総称。マジカルミライには次の 6 人が登場する。

> **用語は「ボーカロイド」で統一する。**
> 「バーチャルシンガー」とは呼ばない。これはこのドメインで意味の異なる語なので、
> 画面の文言・コードのコメント・データセットのコメント・ドキュメントのいずれでも
> 使わないこと。他言語の表記も揃える (en: Vocaloid / zh-Hant: VOCALOID /
> ko: 보컬로이드)。コード上の型名 `Vocaloid` はこの用語に対応している。

| ID      | キャラクター名 | テーマカラー        | カラーコード |
| ------- | -------------- | ------------------- | ------------ |
| `miku`  | 初音ミク       | ブルーグリーン      | `#39C5BB`    |
| `rin`   | 鏡音リン       | オレンジ / イエロー | `#FFCC11`    |
| `len`   | 鏡音レン       | イエロー            | `#FFEE11`    |
| `luka`  | 巡音ルカ       | ピンク              | `#FFBACC`    |
| `meiko` | MEIKO          | レッド              | `#DD4444`    |
| `kaito` | KAITO          | ブルー              | `#3366CC`    |

**重要なルール:**

- **1 曲を複数人で歌うことがある。** だから歌唱者は単数ではなく常に配列で持つ。
- **同じ曲でも年度によって歌唱するキャラが変わることがある。** そのため楽曲マスタ
  (`dataset/songs.yaml`) の `singers` は「原曲の歌唱者」を表し、その年だけ違う場合は
  `setlist.yaml` の枠側で上書きする。UI は上書きがあればそちらを優先する。

## 開催回 (Edition)

- 概ね **年に一度**開催される。
- 名前は「マジカルミライ 2013」のような西暦形式が基本だが、**10 周年のときは
  「マジカルミライ 10th Anniversary」** で西暦が入らなかった。今後も変わりうる。
  そのため識別子は西暦ではなく `slug` (`'2023'` / `'10th'`) で持ち、並び順にだけ
  `year` を使う。
- **開催が暦年をまたぐことがある。** 10th の札幌公演は 2023 年 2 月開催だった。
  「年 = 開催回」ではなく「開催回が複数の公演を持つ」構造にしているのはこのため。

## 公演 (Performance)

- 基本は **1〜3 公演**。かつて 1 公演、その後 2 公演、近年は 3 公演。
  **将来 3 公演体制でなくなる可能性があるので、公演数は固定しない。**
- 「TOKYO」「OSAKA」に加えて、その他の地方が 1 公演。ただし初期は該当しない
  (2013 年は横浜のみ、2015〜2017 年は東京のみ)。
- 公演地のテーマカラーは `region` で決まる。`tokyo` / `osaka` **以外はすべて `other`**
  に落ちるので、新しい公演地が増えても変更不要。

  | region  | 色              | CSS 変数               |
  | ------- | --------------- | ---------------------- |
  | `tokyo` | 青系 (KAITO)    | `--color-region-tokyo` |
  | `osaka` | 赤系 (MEIKO)    | `--color-region-osaka` |
  | `other` | 黄系 (鏡音リン) | `--color-region-other` |

- **日程は年度ごとに微妙に異なる。** 「例年 8 月」のような丸めはせず、
  具体的な日付 (`YYYY-MM-DD`) を持って表示する。

## セットリスト (Setlist)

- **公演地によって数曲が異なる。** さらに**同じ公演地でも日替わりで曲が変わる**。
- **昼公演と夜公演で異なる**場合もある。
- そのため曲順の「枠」は 1 曲に固定されない。枠は候補 (`variants`) の配列を持ち、
  候補が 1 つだけの枠が固定曲にあたる (`Track.variants`)。
- 10th の札幌公演のように公演地ごとに曲目が大きく違う場合があるため、1 つの開催回が
  複数のセットリストを持てる (`EditionEntry.setlists`)。
- 曲順の枠が入れ替わる理由は 2 つある。**会場替わり** (会場ごとに違う) と
  **日程替わり** (日や昼夜で違うが会場では出し分けない)。同時に起きることもある。
  どちらでも言い表せない入れ替わりは **日替わり** と呼ぶ。
  **この区別はデータに書かず、候補に付けた「どの公演回で演奏されたか」から計算する。**
- **テーマソング**と**楽曲グランプリ**という概念がある。どちらも曲順の枠につくタグ
  (`theme-song` / `grand-prix`) として表現する。他に `encore` / `band-intro` /
  `bonus-track` がある。`bonus-track` は円盤収録のみで公演では未演奏。

---

# 技術スタック

| 領域                 | 採用技術                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| パッケージマネージャ | pnpm (`packageManager` で固定。npm / yarn は使わない)                    |
| 言語                 | TypeScript                                                               |
| UI ランタイム        | React 19                                                                 |
| ビルド               | Vite + `@vitejs/plugin-react`                                            |
| CSS                  | Tailwind CSS v4 (`@tailwindcss/vite`、設定ファイルなしの CSS-first)      |
| UI コンポーネント    | HeroUI v3 (`@heroui/react` + `@heroui/styles`)                           |
| アイコン             | react-icons                                                              |
| アニメーション       | motion (framer-motion 後継) / gsap / React Bits                          |
| データ               | dataset/ の YAML を `yaml` パッケージでビルド時に取り込む                |
| UI カタログ          | Storybook 10 (`@storybook/react-vite`)                                   |
| テスト               | Vitest + Storybook addon-vitest (Playwright / Chromium のブラウザモード) |
| Lint                 | oxlint                                                                   |
| フォーマット         | **oxfmt** (Prettier は使わない)                                          |
| Git フック           | husky + lint-staged                                                      |
| デプロイ             | GitHub Pages (`.github/workflows/deploy.yml`)                            |

## コマンド

```bash
pnpm dev              # Vite 開発サーバー (http://localhost:5173)
pnpm build            # tsc -b && vite build
pnpm preview          # ビルド成果物のプレビュー
pnpm storybook        # Storybook (http://localhost:6006)
pnpm build-storybook  # Storybook の静的ビルド
pnpm test             # Vitest (Storybook のストーリーをブラウザで実行)
pnpm lint             # oxlint
pnpm typecheck        # tsc -b
pnpm format           # oxfmt --write .
pnpm format:check     # oxfmt --check .  (CI と pre-commit で実行される)
```

---

# ソースコード構成 (DDD)

依存の向きは **presentation → application → domain**、`infrastructure` が domain の
型に合わせて外部データを変換する。**`src/domain/` は React にも Vite にも依存しない。**

```
dataset/                  データの正 (source of truth)。README.md に編集方法。
src/
  domain/                 ドメイン層。純粋な型とルールのみ
    vocaloid/Vocaloid.ts    ボーカロイド、LocalizedText
    song/Song.ts            楽曲 (曲名が自然キー、作曲者は合作があるので配列)
    song/musicServiceUrl.ts 各音楽サービスへの導線を決めるポリシー
    edition/Edition.ts      開催回
    edition/Performance.ts  公演地ごとの公演
    edition/Show.ts         1 回の公演 (昼/夜)
    edition/Region.ts       公演地の区分とテーマカラー
    setlist/Setlist.ts      セットリスト
    setlist/Track.ts        曲順の枠 (候補と、演奏された公演回の参照を持つ)
    setlist/TrackVariation.ts 会場替わり/日程替わりの判定 (shows から計算)
    setlist/TrackTag.ts     枠のタグ
    catalog/Catalog.ts      全体の集約 + 参照整合性の検証
  application/            ユースケース
    searchSongs.ts          曲名の逐次検索 (インデックス構築と検索)
  infrastructure/         外部との境界
    dataset/loadCatalog.ts  dataset/ の YAML を取り込む
    dataset/rawTypes.ts     YAML をそのまま写した型
    dataset/toCatalog.ts    生データ → ドメインモデルの変換
    i18n/                   多言語対応 (ja / en / zh-Hant / ko)
  presentation/           React
    App.tsx
    providers/              Catalog / Locale / Theme
    hooks/                  ハッシュルーティング、キーボード操作、日付整形
    components/             UI コンポーネント + .stories.tsx
    backgrounds/            年度ごとの背景アニメーション
  components/react-bits/  React Bits から取り込んだベンダーコード
```

## 規約

### インポート

- `@/*` は `src/*` のエイリアス。同一ディレクトリ内は相対パス、それ以外は `@/` を使う。
- エイリアスは `tsconfig.app.json` / `vite.config.ts` / **ルートの `tsconfig.json`** の
  3 か所に定義がある。ルートの `paths` は shadcn CLI がエイリアスを解決するのに使う。
  消すと `./@/components/...` という実ディレクトリが作られてしまう。

### 層をまたぐときの決まり

- **ドメイン層に React を持ち込まない。** `import type { ReactNode }` すら書かない。
- **YAML の形をドメインに漏らさない。** `rawTypes.ts` は YAML の写しで、必ず
  `toCatalog.ts` を通してドメインの型に変換する。データ形式を変えるときはここだけ直す。
- **表示ロジックはドメインに置かない。** ただし「動画 ID が無ければ検索リンクに落とす」
  のような意思決定はドメインのポリシー (`musicServiceUrl.ts`)。

### アクセシビリティ

**すべての対話要素 (`button` / `a` / `select` / `input` / `iframe`) に、
読み上げ可能な名前を必ず持たせる。** 新しくコントロールを足したら、ここを確認する。

名前の与え方は要素によって使い分ける。

| ケース                                          | 与え方                                           |
| ----------------------------------------------- | ------------------------------------------------ |
| アイコンのみのボタン                            | `aria-label` を付ける                            |
| 中身が数値や短い記号だけ (年タブ、統計の行など) | `aria-label` で用途まで書く                      |
| 画像だけのボタン                                | `<span className="sr-only">` を中に置く          |
| `iframe`                                        | `title` を付ける                                 |
| `select`                                        | `<label className="sr-only" htmlFor>` を対にする |
| 十分な文言が見えているボタン・リンク            | **`aria-label` は付けない**                      |

最後の行が重要で、見えている文言があるボタンに `aria-label` を重ねると、
読み上げ名が見た目と食い違い、音声操作で「ボタン名を読み上げて押す」操作が壊れる。
**目的は「名前を持たせること」であって「`aria-label` を付けること」ではない。**

**`aria-label` の文言は翻訳キーから取る。** `a11y.*` に置いて 4 言語すべてに用意する
(日本語だけ入れると他言語のときに日本語が読み上げられる)。年や曲名は
`t('a11y.viewEdition', { year })` のようにプレースホルダで差し込む。

装飾目的のアイコンには `aria-hidden` を付けて、読み上げから外す。

確認方法:

```js
// ブラウザのコンソールで、名前を持たない対話要素を洗い出す
;[...document.querySelectorAll('button, a, select, input, iframe')].filter(
  (e) => !(e.getAttribute('aria-label')?.trim() || e.innerText.trim()),
)
```

### 画面の文言

**サイトの表記はデータが完全に揃っている前提で書く。** 公開時にはデータを完成させる方針
なので、画面に次のような文言を出さない。

- 「まだ収集できていません」「未収集の年は含まれません」のような、データの欠けを断る文言
- 「重複を除いた数です」「1 回と数えます」のような、集計方法の内部仕様の説明

データの実際の収集状況や集計ルールは **`dataset/README.md` とコードのコメントに書く**。
画面はあくまで完成した情報として見せる。

`edition.noSetlist` のような空状態の文言は、表示上のフォールバックとして残してよい。

### スタイル

- `src/index.css` のインポート順は **必ず** `tailwindcss` → `@heroui/styles`。
- HeroUI v3 は Provider 不要。`<HeroUIProvider>` は存在しないので追加しない。
- HeroUI v3 は複合コンポーネント形式 (`Card.Header` / `Chip.Label` など)。
  v2 (NextUI) の `CardHeader` を直接 import する書き方とは異なる。
  - `Button`: `variant` = `primary` | `secondary` | `tertiary` | `outline` | `ghost` | `danger`
  - `Chip`: `variant` = `primary` | `secondary` | `tertiary` | `soft`,
    `color` = `default` | `accent` | `success` | `warning` | `danger`
  - `Card`: `variant` = `default` | `secondary` | `tertiary` | `transparent`
- ダークモードは `<html>` の `data-theme` 属性 (+ `.dark` クラス) で切り替える。
  HeroUI の `dark:` バリアントがこの両方を見るため、Tailwind 側の設定は不要。

### コンポーネント

- 新しい UI コンポーネントには必ず `*.stories.tsx` を併置する。Storybook が UI 確認の主経路。
- ストーリーは `.storybook/preview.tsx` のデコレータで Theme / Locale / Catalog の
  各 Provider に包まれる。カタログは実データを読むので、ストーリーはデータセットの
  変更に自動で追従する。

### React Bits の追加

React Bits は shadcn 互換レジストリで配布されている。

```bash
pnpm dlx shadcn@latest add https://reactbits.dev/r/<ComponentName>-TS-TW
```

`components.json` の `aliases.components` により `src/components/react-bits/<Name>.tsx`
に配置される。取り込み後は次に注意する。

- **`motion` が `^12` にダウングレードされる。** レジストリ側が `motion@^12.23.12` を
  宣言しているため。動作確認済みの最新版に戻すこと: `pnpm add motion@latest`
- 取り込み後は `pnpm format` を実行してからコミットする。
- ベンダーコードなので原則手を入れない。`pnpm lint` は `SplitText.tsx` で警告を 3 件
  出すが、上流由来の警告なので CI は落ちない。

**`src/components/react-bits/` の `SplitText` と `ShinyText` は、現在アプリ本体から
参照されていない。** どちらも一度は組み込んだが、デザイン調整で外した経緯がある
(`ShinyText` は副題の廃止、`SplitText` は公演名のアニメーション廃止)。
**後で別の箇所に使う前提で意図的に残しているので、未使用を理由に削除しないこと。**
Storybook にはストーリーがあるので、使いどころを探すときはそこで挙動を確認できる。

### フォーマット / Lint

- フォーマッタは oxfmt のみ。Prettier や Biome を追加しない。
- 設定は `.oxfmtrc.json` (セミコロンなし、シングルクォート、printWidth 100)。
- コミット時に lint-staged が `oxfmt --check` と `oxlint` を走らせる。
  `oxfmt --check` は書き換えないので、失敗したら `pnpm format` を実行して再コミットする。

### デプロイ

- **配信は自動では起きない。** `main` にマージしても何も配信されず、
  `.github/workflows/deploy.yml` を **workflow_dispatch で手動実行**したときだけ動く。
  リリースするタイミングを人が決められるようにするため。
- 実行時に `patch` / `minor` / `major` を選ぶ。直近の `vX.Y.Z` タグから次の版を計算し
  (タグが無ければ `v0.0.0` から数える)、ビルド → Pages へ配信 → タグとリリース作成、の順に進む。
- リリースノートは `gh release create --generate-notes` が生成し、**前回のリリース以降に
  マージされた PR が一覧になる**。タグはリリース作成時にそのコミットへ打たれるので、
  事前の `git push --tags` は要らない。
  **配信できたコミットにだけタグが付く** よう `needs: [version, deploy]` にしてある。
- **配信先に依存する値は `.env` の 2 つだけにまとめてある。**

  | 変数             | 用途                                             |
  | ---------------- | ------------------------------------------------ |
  | `VITE_SITE_URL`  | 公開 URL。canonical / OGP / sitemap / robots.txt |
  | `VITE_BASE_PATH` | 配信のサブパス。Vite の `base`                   |

  秘匿情報ではないのでリポジトリにコミットする (CI のビルドでも必要)。
  **独自ドメインへ移すときは、この 2 つを直すだけでよい。** `index.html` は Vite の
  `%VITE_SITE_URL%` 置換で、アプリ側は `import.meta.env` で同じ値を見ている。
  型は `src/vite-env.d.ts` の `ImportMetaEnv` に書く。

- GitHub Pages はリポジトリ名のサブパス配信なので `VITE_BASE_PATH` を `/setlist/` にしている。
- 検索向けの `sitemap.xml` と `robots.txt` は `vite.config.ts` の `seoFiles` プラグインが
  ビルド時に生成する。dataset に年を足せば URL が増えるので手で並べ直さなくてよい。
- 静的ホスティングではどの URL も同じ HTML が返るため、HTML の `title` / `description` は
  サイト全体の既定値でしかない。ページごとの文言は `useDocumentMeta` が描画後に差し替える。
- ルーティングは History API による実パス (`/setlist/2023` `/setlist/statics`)。
  静的ホスティングは実体の無いパスに 404 を返すので、`vite.config.ts` の
  `spaFallback` プラグインが `index.html` を `404.html` に複製している。
  **GitHub Pages はこの 404.html を返すため、これでディープリンクが動く。**
  この複製を消すとリロード時に 404 になる。

---

# 開発フロー

このリポジトリは **GitHub Flow** で開発している。詳細は [CONTRIBUTING.md](./CONTRIBUTING.md)。
`main` へ直接コミットせず、必ずトピックブランチと Pull Request を経由する。
