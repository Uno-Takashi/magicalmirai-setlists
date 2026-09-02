# マジカルミライ歴代セットリスト

[![CI](https://github.com/Uno-Takashi/magicalmirai-setlists/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Uno-Takashi/magicalmirai-setlists/actions/workflows/ci.yml?query=branch%3Amain) [![Website](https://img.shields.io/website?url=https%3A%2F%2Fmagicalmirai-setlists.u-not.app%2F&up_message=online&down_message=offline&label=website)](https://magicalmirai-setlists.u-not.app/)

初音ミク「マジカルミライ」歴代公演のセットリストを年ごとに振り返るファンページ。

**公開先:** https://magicalmirai-setlists.u-not.app/

## 概要

- 初音ミク「マジカルミライ」歴代公演のセットリストを振り返るためのウェブページです
- グラフィカルで使いやすいUI
- スマートフォン・タブレットに対応
- YouTubeを使った埋め込み機能に対応

## 開発環境構築

### インストール

以下のソフトウェアをインストールしてください

- node

### 初回セットアップ

リポジトリをクローンしたのち、以下のコマンドでセットアップしてください。

```bash
corepack enable
pnpm install
pnpm dev        # http://localhost:5173
```

[Dev Container](https://code.visualstudio.com/docs/devcontainers/containers) に対応しています。
手順は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

### セットリストを追加・修正する

セットリストに掲載するデータは [`dataset/`](./dataset/) の YAML に記載します。

書き方は[dataset/README.md](./dataset/README.md) を参照してください。

```
dataset/
  vocaloids.yaml     ボーカロイド6人のマスタ
  songs.yaml         楽曲マスタ (全年度で共有)
  2023/
    edition.yaml     公演地・会場・日程
    setlist.yaml     セットリスト
```

### よく使うコマンド

```bash
pnpm dev              # 開発サーバー
pnpm storybook        # Storybook (http://localhost:6006)
pnpm build            # 本番ビルド
pnpm test             # Vitest (Storybook のストーリーを実ブラウザで実行)
pnpm lint             # oxlint
pnpm typecheck        # tsc -b
pnpm format           # oxfmt --write .
pnpm run test:dataset # datasetの検証
```
