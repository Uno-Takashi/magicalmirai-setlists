import { motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'
import type { Edition } from '@/domain/edition/Edition'
import { regionColorVar } from '@/domain/edition/Region'
import type { Setlist } from '@/domain/setlist/Setlist'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * セットリストの名前。適用先の公演地を並べて「大阪・東京」のように呼ぶ。
 *
 * データはセットリストに名前を持たず、適用先の公演 id しか持たない。
 * 名前が要るのは表示のときだけなので、ここで公演地から組み立てる。
 */
function setlistName(setlist: Setlist, edition: Edition, locale: string, fallback: string): string {
  const cities = setlist.performanceIds.flatMap((id) => {
    const performance = edition.performances.find((p) => p.id === id)
    return performance === undefined ? [] : [localize(performance.city, locale)]
  })
  return cities.length === 0 ? fallback : cities.join('・')
}

/**
 * 開催回が複数のセットリストを持つときの切り替え。
 *
 * 10th の札幌公演のように、同じ開催回でも曲目が大きく違うことがある。
 * 3 つ以上に増えても崩れないよう、札は折り返して並べる。
 * セットリストが 1 つだけの年は何も出さない。
 */
export function SetlistSwitch({
  setlists,
  edition,
  selectedIndex,
  onSelect,
}: {
  setlists: readonly Setlist[]
  edition: Edition
  selectedIndex: number
  onSelect: (index: number) => void
}) {
  const { t, locale } = useLocale()
  // 選択中の地は 1 つを共有して動かす。切り替えると、押した札まで滑って移る。
  const indicatorId = useId()
  const reduceMotion = useReducedMotion()
  if (setlists.length <= 1) return null

  return (
    // 1 つの帯の中で切り替えるツールバー。増えて幅に収まらないときは、
    // 折り返して帯が崩れるより、帯ごと横スクロールさせる。
    <div className="mb-3 max-w-full overflow-x-auto px-1 pb-1">
      <div
        role="group"
        aria-label={t('setlist.switch')}
        className="surface-card inline-flex w-max gap-0.5 rounded-xl p-1"
      >
        {setlists.map((setlist, index) => {
          const selected = index === selectedIndex
          // 札の色は最初の適用先の公演地に合わせる。切り替え先が公演地カードの
          // どれにあたるのかを、色でも見分けられるようにする。
          const region = edition.performances.find(
            (performance) => performance.id === setlist.performanceIds[0],
          )?.region
          const color = region === undefined ? undefined : regionColorVar(region)

          return (
            <button
              key={`${index}-${setlist.performanceIds.join('-')}`}
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={selected}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                selected ? '' : 'text-muted transition hover:bg-black/[0.04]'
              }`}
            >
              {/*
                選択中の地。公演地の色を敷くが、文字色は変えない。
                公演地の色には鏡音リンの黄 (#FFCC11) があり、白文字だと読めない。
                動きを減らす設定のときは滑らせず、その場で出す。
              */}
              {selected ? (
                <motion.span
                  layoutId={reduceMotion ? undefined : indicatorId}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  aria-hidden
                  className="absolute inset-0 rounded-lg shadow-sm"
                  style={
                    color === undefined
                      ? { backgroundColor: 'rgb(148 163 184 / 0.2)' }
                      : { backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)` }
                  }
                />
              ) : null}
              {/* 地は絶対配置なので、文字とドットを前に出す */}
              <span className="relative inline-flex items-center gap-1.5">
                {color !== undefined ? (
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ) : null}
                {setlistName(setlist, edition, locale, t('setlist.nth', { index: index + 1 }))}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
