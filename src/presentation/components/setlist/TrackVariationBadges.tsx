import { LuCalendarRange, LuMapPin, LuShuffle } from 'react-icons/lu'
import { TbSwitchHorizontal } from 'react-icons/tb'
import type { VariationAxis } from '@/domain/setlist/TrackVariation'
import { MUTED_CHIP } from '@/presentation/components/ui/chipStyles'
import { CollapsibleChip } from '@/presentation/components/ui/CollapsibleChip'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/** 入れ替わりの軸ごとのアイコン。会場・昼夜・日程・日替わりを見分ける目印。 */
const VARIATION_ICON = {
  venue: LuMapPin,
  session: TbSwitchHorizontal,
  schedule: LuCalendarRange,
  daily: LuShuffle,
} as const

/** その枠が何で入れ替わるのかを示す札。軸が複数あるときは並べて出す。 */
export function TrackVariationBadges({ axes }: { axes: readonly VariationAxis[] }) {
  const { t } = useLocale()

  return axes.map((kind) => {
    const Icon = VARIATION_ICON[kind]
    return (
      <CollapsibleChip
        key={kind}
        className={`${MUTED_CHIP} rounded px-1.5 py-0.5 text-[10px] font-semibold`}
        mark={<Icon className="shrink-0" aria-hidden />}
      >
        {t(`track.variation.${kind}`)}
      </CollapsibleChip>
    )
  })
}
