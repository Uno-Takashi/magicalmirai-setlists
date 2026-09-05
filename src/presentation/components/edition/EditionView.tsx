import { useState } from 'react'
import type { EditionEntry } from '@/domain/catalog/Catalog'
import type { Edition } from '@/domain/edition/Edition'
import type { Performance } from '@/domain/edition/Performance'
import { performedTracks, type Setlist } from '@/domain/setlist/Setlist'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { titleImageOf } from '@/infrastructure/dataset/titleImages'
import { EditionInfoPanel } from '@/presentation/components/edition/EditionInfoPanel'
import { useEditionTheme } from '@/presentation/components/edition/useEditionTheme'
import { PerformanceDialog } from '@/presentation/components/edition/PerformanceDialog'
import { SetlistDownloadButton } from '@/presentation/components/setlist/SetlistDownloadButton'
import { SetlistSwitch } from '@/presentation/components/setlist/SetlistSwitch'
import { SetlistTimeline } from '@/presentation/components/setlist/SetlistTimeline'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/** 開催回の見出し。タイトル画像があれば画像を出し、見出しは読み上げ専用にする。 */
function EditionHeading({ edition }: { edition: Edition }) {
  const { locale } = useLocale()
  const name = localize(edition.name, locale)
  const titleImage = titleImageOf(edition.year)
  // 背景に埋もれる年だけ、その年の色で上書きする (既定は text-miku)
  const titleColor = useEditionTheme(edition.slug)?.titleColor

  return (
    <header className="mb-5">
      {/* dataset/<年>/title.* があれば中央にタイトル画像を出す */}
      {titleImage !== undefined ? (
        <img
          src={titleImage}
          alt={name}
          className="mx-auto mb-5 block max-h-40 w-auto max-w-full"
        />
      ) : null}

      {/* 画像がある年は見出しを読み上げ専用にして、同じ文字の重複を避ける */}
      <h2
        className={
          titleImage !== undefined
            ? 'sr-only'
            : 'text-miku text-2xl leading-snug font-black sm:text-3xl'
        }
        style={titleColor !== undefined ? { color: titleColor } : undefined}
      >
        {name}
      </h2>
    </header>
  )
}

/** セットリストの本体。複数持つ年は切り替えの札を上に置く。 */
function SetlistPanel({ setlists, edition }: { setlists: readonly Setlist[]; edition: Edition }) {
  const { t } = useLocale()

  // 見ているセットリスト。この画面は開催回ごとに組み直される (EditionCarousel が
  // slug を key にしている) ので、選択が年をまたいで残ることはない。
  const [index, setIndex] = useState(0)
  const setlist = setlists[index]

  if (setlist === undefined) {
    return (
      <p className="surface-card text-muted rounded-xl p-6 text-center text-sm">
        {t('edition.noSetlist')}
      </p>
    )
  }

  return (
    <div className="surface-card rounded-2xl p-3 sm:p-5">
      <SetlistSwitch
        setlists={setlists}
        edition={edition}
        selectedIndex={index}
        onSelect={setIndex}
      />
      {/* 曲数の行に保存の導線を並べる。曲順の一覧そのものを持ち出す操作なので、
          一覧の見出しにあたるこの行に置き、位置は各行の操作と同じ右端に揃える */}
      <div className="mb-2 flex items-center justify-between gap-2 pl-2">
        <p className="text-muted text-xs font-semibold">
          {t('edition.trackCount', { count: performedTracks(setlist).length })}
        </p>
        <SetlistDownloadButton
          setlist={setlist}
          edition={edition}
          setlistIndex={index}
          setlistCount={setlists.length}
        />
      </div>
      {/* 切り替えたら組み直して、曲が上から順に現れるアニメーションを流し直す */}
      <div key={index}>
        <SetlistTimeline setlist={setlist} edition={edition} />
      </div>
    </div>
  )
}

/** 開催回 1 つ分の中身。見出し・公演情報・セットリストを縦に並べる。 */
export function EditionView({ entry }: { entry: EditionEntry }) {
  const { edition, setlists } = entry

  // 会場情報のモーダル。開くきっかけは公演地カードだけなので、ここで持つ。
  const [detail, setDetail] = useState<Performance | null>(null)

  return (
    <section className="relative min-h-full">
      <div className="relative mx-auto w-full max-w-3xl px-4 pt-6 pb-24">
        <EditionHeading edition={edition} />
        {/* 公式サイト・日程・会場は既定で畳んでおく */}
        <EditionInfoPanel edition={edition} onShowPerformance={setDetail} />
        <SetlistPanel setlists={setlists} edition={edition} />
      </div>

      <PerformanceDialog performance={detail} onClose={() => setDetail(null)} />
    </section>
  )
}
