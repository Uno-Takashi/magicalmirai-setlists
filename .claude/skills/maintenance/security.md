# 保留中のセキュリティ更新

GitHub の Security タブに出ている脆弱性と、出ていないが実際には入っている脆弱性を洗い出し、
修正版があるのに取り込まれていないものを PR にして取り込む。

## 1. 洗い出す

**GitHub のアラートだけを信じない。** 必ずローカルの監査と両方を見て突き合わせる。

```bash
# GitHub 側
gh api "repos/Uno-Takashi/magicalmirai-setlists/dependabot/alerts?state=open&per_page=100" --paginate \
  -q '.[] | [.number, .security_advisory.severity, .dependency.package.name,
             .security_vulnerability.vulnerable_version_range,
             (.security_vulnerability.first_patched_version.identifier // "修正版なし"),
             .dependency.scope, .security_advisory.ghsa_id] | @tsv'
gh api "repos/Uno-Takashi/magicalmirai-setlists/code-scanning/alerts?state=open&per_page=100" --paginate \
  -q '.[] | [.number, .rule.security_severity_level, .rule.id, .most_recent_instance.location.path] | @tsv'
gh api "repos/Uno-Takashi/magicalmirai-setlists/secret-scanning/alerts?state=open" -q '.[] | [.number, .secret_type_display_name] | @tsv'

# ローカルの監査（ロックファイルを直接調べる）
pnpm audit                 # 全体
pnpm audit --prod          # dependencies から辿れるものだけ
```

- API が 403 / 404 を返したら、その機能が無効か権限が無い。「0 件」と区別して報告に書く
  （code scanning は解析を置いていないので `no analysis found`、secret scanning は
  無効なので `disabled` が返る。いまはそれで正しい）。
- **食い違い**（GitHub は 0 件なのに監査では出る、またはその逆）は、それ自体を報告する。
  依存グラフがロックファイルを読めていない可能性がある。
- 閉じられたアラートも見る（`state=dismissed`）。誰かが理由を付けて閉じたものは、
  その理由がいまも成り立つかを確かめるだけにして、勝手に開き直さない。
- `state=fixed` になったのに監査に残るものは、ロックファイルの別の場所（別の親から入った
  別の版）に脆弱な版が残っている。`pnpm why <pkg>` で確かめる。

扱いの範囲:

| 種類                                             | この skill でやること                                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| 依存の脆弱性（Dependabot アラート · 監査の指摘） | §2 以降で PR にして取り込む                                                                    |
| code scanning                                    | 有効になっていれば一覧を報告する。自分のコードの修正なので、依存更新とは別の作業として提案する |
| secret scanning                                  | 有効になっていてアラートがあれば、**止めてユーザーに知らせる。** 値を画面・ログ・PR に出さない |

## 2. なぜ保留になっているか

脆弱性ごとに、次のどれかに分類する。分類で対処が決まる。

| 状態                                         | 見分け方                                                                       | 対処                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| Dependabot の PR が開いている                | アラートの依存名で PR を探す                                                   | SKILL.md §2 で取り込む（ここでは何もしない） |
| 修正版があり、いまの指定範囲に収まる         | 親の指定レンジが修正版を含む。ロックファイルが古いだけ                         | §4 の A                                      |
| 修正版があるが、親の依存が古い版を指している | `pnpm why <pkg>` で、親のレンジが修正版を含まない                              | §4 の B → C                                  |
| 修正版があるが、自分で上限を掛けている       | `package.json` の固定（`~` · 完全一致）や `pnpm.overrides`                     | §4 の D                                      |
| 修正版が公開から 24 時間経っていない         | `depdiff.sh npm` の公開日時                                                    | 待つ。次回に回す                             |
| 修正版がプレリリースしか無い                 | 修正版の版名に `rc` · `beta` · `alpha` · `canary` が付く                       | 取り込まない。§5                             |
| 修正版が無い                                 | アドバイザリに patched version が無い                                          | §5                                           |
| Dependabot が PR を作れなかった              | Security タブのアラートに理由が出る（解決できない · PR の上限 · 過去に閉じた） | 理由に応じて A〜D                            |

## 3. 届くかどうかを見積もる

直すかどうかではなく、**急ぎ具合と報告の書き方**を決めるために行う（直せるものは全部直す）。

1. **どこに入るか**（[investigation.md](investigation.md) の §2）
   - **配信物**: 利用者のブラウザで動く。サイトは静的で、利用者から受け取る入力は
     URL（パス · クエリ）と、ブラウザに保存した設定・お気に入りくらい。表示するデータは
     自分たちの dataset だけ
   - **ビルド**: 入力は自分たちのソース · dataset · 依存に限られる。ただし配信物を作るので、
     乗っ取りは配信物に届く
   - **開発機と CI だけ**: Vite の dev サーバ · Storybook（`host: true` · ポート転送で
     同じネットワークから届く）· テスト
2. **脆弱な機能を使っているか**: アドバイザリが挙げる関数・設定・入力経路を、
   このリポジトリか親の依存が通るか
3. **外から届くか**: 攻撃者が入力を送れる経路に乗っているか。配信物なら「細工した URL を
   踏ませる」で届くか。開発用なら「同じネットワークから dev サーバに要求を送る」で届くか

「使っていないから安全」と書くときは、探した語と範囲を添える。分からなければ「届きうる」として扱う。

## 4. 直す

上から順に試し、**最も小さい変更**で脆弱な版が消えるものを選ぶ。

```bash
git switch -c fix/<pkg>-<GHSA の末尾か CVE> origin/main
```

### A. ロックファイルの中だけで上げる

指定範囲はそのままで、解決結果だけを修正版へ進める。

```bash
pnpm update <pkg> --depth Infinity --lockfile-only && pnpm install --frozen-lockfile
```

`--depth` を付けないと、推移的依存は動かない。直接依存にこれを使うと `package.json` の
範囲まで書き換わることがあるので、`git diff package.json` を確かめる（範囲を書き換えたくなければ戻す）。
`pnpm audit --fix` はまとめて上げてしまう（しかも `overrides` を書き足す）ので使わない。

### B. 親の依存を上げる

親の新しい版が修正版を要求しているなら、親を上げるのが本筋。親の更新として
[investigation.md](investigation.md) の調査をする。親が major を跨ぐなら C を先に検討する。

### C. 上書きで修正版を強制する（推移的依存）

`package.json` の `pnpm.overrides` に足す（まだ無ければ作る）。

```json
"pnpm": {
  "overrides": {
    "<pkg>@<脆弱なレンジ>": "^<修正版>"
  }
}
```

- 左辺は**脆弱なレンジだけ**に絞る。major の違う系統を巻き込まない
  （3.x と 4.x が同居しているなら、系統ごとに行を分ける）。
- 修正版が親の要求する major の中にあること。major を跨いで強制すると、親が壊れる。
  跨ぐしかないなら B に戻るか、§5 へ。
- 足したら `pnpm install` でロックファイルを作り直し、`pnpm-lock.yaml` の `overrides:` に
  載ったことを確かめる（`depdiff.sh lock` の「設定」に出る）。

### D. 自分で掛けた上限を外す

上限には理由がある。`git log -S'<その行>' -- package.json` で入れた commit を探し、
理由がいまも成り立つかを確かめる（例: `typescript` の `~` は minor を手で上げるため）。
成り立つなら外さず、§5 へ。

### 直したら

```bash
.claude/skills/maintenance/scripts/depdiff.sh lock origin/main     # 狙った依存だけが動いたか
pnpm audit                                                         # その指摘が消えたか
pnpm why <pkg>                                                     # 脆弱な版が残っていないか
```

- 狙っていない依存が動いていたら、原因を調べる。説明が付かなければやり直す。
- 動いた依存すべてに [investigation.md](investigation.md) の調査をする。
  **修正の commit を読み、何をどう直したかを PR に書く。**
- SKILL.md の「ゲートの回し方」の区分で `gates.sh` を回す。

### ついでに確かめる

`pnpm.overrides` の既存の行のうち、親の更新でもう要らなくなったものは外す
（行を消して `pnpm install` し、`pnpm why <pkg>` で脆弱な版が戻らないことを確かめる）。
外すのは別の PR にする。

### PR を出して取り込む

```bash
git status --porcelain      # ゲートが作ったファイルが出たら、原因を確かめて消す（追跡しない）
git add package.json pnpm-lock.yaml
git commit -m "fix(deps): <pkg> を <修正版> へ上げる（<GHSA-ID>）"
git push -u origin HEAD
gh pr create -R Uno-Takashi/magicalmirai-setlists --title "fix(deps): <pkg> <旧> -> <新> (<GHSA-ID>)" --body-file <本文>
```

本文（`.github/pull_request_template.md` の見出しに沿う）に書くこと:

- 脆弱性（GHSA / CVE · 深刻度 · 影響する版の範囲 · 概要）
- どこに入っていて、届くかどうか（§3）
- なぜ保留になっていたか（§2）と、選んだ直し方（A〜D）
- [investigation.md](investigation.md) の記録
- 監査の結果（直す前と後）

PR の CI が**すべて緑**になってから
`gh pr merge <N> -R Uno-Takashi/magicalmirai-setlists --squash --match-head-commit "$(git rev-parse HEAD)"`。
マージ後に `git fetch` して、次の脆弱性は新しい `origin/main` から始める。

## 5. 直せないもの

修正版が無い · プレリリースしか無い · 上限を外せない · major を跨がないと直らない、のどれか。
**無理に入れない。** 代わりに次を行う。

1. §3 の見積もりを書く（どこに入り、届くか）
2. 緩和策があるか調べる（脆弱な機能を使わない設定 · 親の依存の差し替え）。
   緩和策がコードや設定の変更になるなら、PR にする前にユーザーに提案する
3. 報告に載せる。**配信物に入る high / critical** は、ユーザーに知らせたうえで issue にする
   （同じ件の open な issue があればそこへ追記する）。issue に攻撃手順は書かない
4. 次に見るべき条件を書く（「<pkg> の <版> が正式に出たら A で上がる」など）

残ったアラートは、次回の保守で拾う手掛かりになる（dismiss しない）。
