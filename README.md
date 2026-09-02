# マジカルミライ歴代セットリスト

[![CI](https://github.com/Uno-Takashi/magicalmirai-setlists/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Uno-Takashi/magicalmirai-setlists/actions/workflows/ci.yml?query=branch%3Amain) [![Website](https://img.shields.io/website?url=https%3A%2F%2Fmagicalmirai-setlists.u-not.app%2F&up_message=online&down_message=offline&label=website)](https://magicalmirai-setlists.u-not.app/)

初音ミク「マジカルミライ」歴代公演のセットリストを年ごとに振り返るファンページ。

**公開先:** https://magicalmirai-setlists.u-not.app/

## 機能

- 1 年を 1 ページにまとめて表示。左右スワイプ / 矢印キー / タブで年を切り替え (アニメーション付き)
- その年の全公演 (公演地・会場・日程・昼夜) を 1 画面で俯瞰
- 日替わり曲・会場別の差し替え・テーマソング・楽曲グランプリを枠ごとに表示
- 曲名の逐次検索 (1 文字ごとに結果を更新)、登場した年へのジャンプ
- YouTube 埋め込みプレビュー、Spotify / Apple Music へのリンク
- ダークモード / 多言語 (日本語・English・繁體中文・한국어) / スマートフォン対応
- 年度ごとの背景アニメーション

## 開発環境構築

### 初回セットアップ

```bash
corepack enable
pnpm install
pnpm dev        # http://localhost:5173
```

VS Code の Dev Container にも対応しています (Ubuntu ベース + Node feature)。
手順は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

### セットリストを追加・修正する

データは [`dataset/`](./dataset/) の YAML がすべてです。コードを触らずに、
年ディレクトリの YAML を編集するだけで更新できます。書き方は
[dataset/README.md](./dataset/README.md) を参照してください。

```
dataset/
  vocaloids.yaml     ボーカロイド6人のマスタ
  songs.yaml         楽曲マスタ (全年度で共有)
  2023/
    edition.yaml     公演地・会場・日程
    setlist.yaml     セットリスト
```

存在しない曲を参照するとアプリの起動時にエラーになるので、タイプミスはすぐ気づけます。

### よく使うコマンド

```bash
pnpm dev              # 開発サーバー
pnpm storybook        # Storybook (http://localhost:6006)
pnpm build            # 本番ビルド
pnpm test             # Vitest (Storybook のストーリーを実ブラウザで実行)
pnpm lint             # oxlint
pnpm typecheck        # tsc -b
pnpm format           # oxfmt --write .
```
