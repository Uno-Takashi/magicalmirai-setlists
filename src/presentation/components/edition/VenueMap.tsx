import type { Performance } from '@/domain/edition/Performance'
import { venueMapEmbedUrl } from '@/domain/edition/venueMapUrl'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 会場の場所。地図は開いたときだけ読み込ませたいので、この中で iframe を作る。
 *
 * Google マップへ飛ぶリンクは添えない。埋め込み地図が「大きな地図で見る」を
 * 自前で出すので、同じ行き先のボタンが 2 つ並ぶことになる。
 */
export function VenueMap({ performance }: { performance: Performance }) {
  const { t, locale } = useLocale()
  const embedUrl = venueMapEmbedUrl(performance, locale)
  if (embedUrl === undefined || performance.venue === undefined) return null

  return (
    <iframe
      src={embedUrl}
      title={t('a11y.venueMap', { venue: localize(performance.venue, locale) })}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="h-56 w-full rounded-xl border-0"
    />
  )
}
