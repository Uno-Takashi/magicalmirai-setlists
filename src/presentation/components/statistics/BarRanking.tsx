import { useMemo, type ReactNode } from 'react'

export interface BarRankingRow {
  readonly id: string
  /** 行の見出し。色だけに頼らないよう常に表示する。 */
  readonly label: ReactNode
  /** バーの長さに使う値。 */
  readonly value: number
  /** 見出しに続けて小さく添える補足 (曲の作曲者など)。 */
  readonly sublabel?: string
  /** 値の隣に出す補足 (「累計 12 演奏」など)。 */
  readonly note?: string
  /** 行頭に置くアクセント色。識別は label が担うので装飾扱い。 */
  readonly accent?: string
  readonly onSelect?: () => void
  /** 押せる行に付ける読み上げ用の名前。行の中身は数値が多く、用途が伝わらないため。 */
  readonly ariaLabel?: string
}

/**
 * 単系列の横棒ランキング。
 *
 * 系列が 1 本なので凡例は置かず、代わりに全行を直接ラベルする。
 * バー色は背景に対して 3:1 を満たすトークンを使い、値も文字で必ず出す
 * (色が読めなくても順位と量が分かるようにするため)。
 */
export function BarRanking({
  rows,
  valueSuffix,
  max,
}: {
  rows: readonly BarRankingRow[]
  /** 値の単位。「曲」「回」など。 */
  valueSuffix: string
  /** バーの基準となる最大値。省略時は行の最大値。 */
  max?: number
}) {
  const scale = max ?? Math.max(1, ...rows.map((row) => row.value))

  // 同じ値は同じ順位にする (1, 2, 2, 4 …)。rows は値の降順で渡ってくる前提なので、
  // 1 度なめて「値が変わった位置」を順位にすればよい。
  // ランキング全体のページは行数が多く、行ごとに全体を探し直すと二乗になる。
  const ranks = useMemo(() => {
    const result: number[] = []
    for (const [index, row] of rows.entries()) {
      // 直前と同じ値なら順位を引き継ぐ。降順で渡ってくるので同値は必ず隣り合う。
      const previous = rows[index - 1]
      const tied = previous !== undefined && previous.value === row.value
      result.push(tied ? result[index - 1]! : index + 1)
    }
    return result
  }, [rows])

  return (
    <ol className="grid gap-2">
      {rows.map((row, index) => {
        const percent = (row.value / scale) * 100
        const content = (
          <>
            <span className="flex items-baseline gap-2">
              <span className="text-muted w-6 shrink-0 text-right text-xs tabular-nums">
                {ranks[index]}
              </span>
              {row.accent !== undefined ? (
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: row.accent }}
                  aria-hidden
                />
              ) : null}
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {row.label}
                {row.sublabel !== undefined ? (
                  <span className="text-muted ml-1.5 text-xs font-normal">{row.sublabel}</span>
                ) : null}
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums">
                {row.value}
                <span className="text-muted ml-0.5 text-xs font-normal">{valueSuffix}</span>
              </span>
              {row.note !== undefined ? (
                <span className="text-muted shrink-0 text-xs tabular-nums">{row.note}</span>
              ) : null}
            </span>
            <span
              className="mt-1 ml-7 block h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--chart-track)' }}
              aria-hidden
            >
              <span
                className="block h-full rounded-full transition-[width] duration-500"
                style={{ width: `${percent}%`, backgroundColor: 'var(--chart-bar)' }}
              />
            </span>
          </>
        )

        return (
          // 行は grid の子なので、既定では中身の min-content より狭くならない。
          // 見出しは truncate (nowrap) なので、その min-content は曲名と作曲者を
          // 続けた全長になる。放っておくと一番長い行に合わせて列全体が広がり、
          // 画面の狭い端末で棒がカードからはみ出す。min-w-0 で縮めるようにする。
          <li key={row.id} className="min-w-0">
            {row.onSelect === undefined ? (
              <div className="block w-full px-1 py-0.5">{content}</div>
            ) : (
              <button
                type="button"
                onClick={row.onSelect}
                aria-label={row.ariaLabel}
                className="block w-full rounded-lg px-1 py-0.5 text-left transition hover:bg-black/[0.04]"
              >
                {content}
              </button>
            )}
          </li>
        )
      })}
    </ol>
  )
}
