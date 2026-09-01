import { Tooltip } from '@heroui/react'
import { LuDownload } from 'react-icons/lu'
import { setlistCsvFilename, setlistCsvRows, toCsv } from '@/application/exportSetlistCsv'
import type { Edition } from '@/domain/edition/Edition'
import type { Setlist } from '@/domain/setlist/Setlist'
import { downloadText } from '@/infrastructure/download/downloadFile'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/** 見出しの文言。並びは application 側の列と揃える。 */
const HEADER_KEYS = [
  'setlist.csv.order',
  'setlist.csv.title',
  'setlist.csv.producers',
  'setlist.csv.singers',
  'setlist.csv.tags',
  'setlist.csv.shows',
] as const

/**
 * 見ているセットリストを CSV で保存する。
 *
 * 表計算ソフトで開いて並べ替えたり、他の年と見比べたりできるようにするためのもの。
 * バックエンドを持たないので、中身はその場で組み立てて落とす。
 */
export function SetlistDownloadButton({
  setlist,
  edition,
  setlistIndex,
  setlistCount,
}: {
  setlist: Setlist
  edition: Edition
  /** 何番目のセットリストか。複数持つ年でファイル名を分けるのに使う。 */
  setlistIndex: number
  setlistCount: number
}) {
  const { t } = useLocale()
  const { catalog } = useCatalog()

  const download = () => {
    const csv = toCsv(
      HEADER_KEYS.map((key) => t(key)),
      setlistCsvRows(setlist, edition, catalog),
    )
    // Excel は BOM が無いと日本語を Shift_JIS と見なして文字化けさせる
    downloadText(setlistCsvFilename(edition, setlistIndex, setlistCount), csv, {
      type: 'text/csv;charset=utf-8',
      bom: true,
    })
  }

  // アイコンだけでは何を落とすのか分からないので、マウスを載せたときに説明を出す。
  // (お気に入りの × のように、押した結果がその場で見える操作には付けない)
  return (
    <Tooltip>
      {/* トリガー自体をボタンとして描画する。既定の div だと入れ子の役割がおかしくなる。 */}
      <Tooltip.Trigger<'button'>
        render={(triggerProps) => (
          <button
            {...triggerProps}
            type="button"
            onClick={download}
            aria-label={t('setlist.download')}
            className="text-muted grid size-6 shrink-0 place-items-center rounded-lg transition hover:bg-black/[0.06]"
          />
        )}
      >
        <LuDownload className="text-xs" aria-hidden />
      </Tooltip.Trigger>
      <Tooltip.Content className="text-xs">{t('setlist.download')}</Tooltip.Content>
    </Tooltip>
  )
}
