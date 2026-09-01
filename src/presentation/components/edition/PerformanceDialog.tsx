import { LuMapPin } from 'react-icons/lu'
import type { Performance } from '@/domain/edition/Performance'
import { regionColorVar } from '@/domain/edition/Region'
import { localize } from '@/domain/vocaloid/Vocaloid'
import { PerformanceSchedule } from '@/presentation/components/edition/PerformanceSchedule'
import { VenueMap } from '@/presentation/components/edition/VenueMap'
import { Modal, ModalHeader } from '@/presentation/components/ui/Modal'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/** 会場で使った施設。公式サイトが会場名しか出していない年は施設名を持たない。 */
function VenueSection({ performance }: { performance: Performance }) {
  const { t, locale } = useLocale()

  return (
    <section>
      <h3 className="text-muted mb-1.5 text-xs font-semibold">{t('performance.halls')}</h3>
      <div className="flex items-start gap-2">
        <LuMapPin aria-hidden className="text-muted mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold break-words">
            {performance.venue !== undefined
              ? localize(performance.venue, locale)
              : t('edition.venueUnknown')}
          </p>
          {performance.halls !== undefined ? (
            <p className="text-muted mt-0.5 text-xs break-words">
              {localize(performance.halls, locale)}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/**
 * 会場の詳細。公演地カードの詳細ボタンから開く。
 *
 * カードは 1 行に何枚も並ぶので会場名までしか置けない。会場で使った施設・
 * 地図・日程といった「その会場に行くための情報」はここにまとめる。
 */
export function PerformanceDialog({
  performance,
  onClose,
}: {
  performance: Performance | null
  onClose: () => void
}) {
  const { t, locale } = useLocale()
  const city = performance === null ? '' : localize(performance.city, locale)

  return (
    <Modal open={performance !== null} onClose={onClose} label={city}>
      {performance === null ? null : (
        <>
          <ModalHeader
            className="mb-4"
            title={
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: regionColorVar(performance.region) }}
                />
                {city}
              </span>
            }
            onClose={onClose}
            closeLabel={t('performance.close')}
          />

          <div className="grid gap-4">
            <VenueSection performance={performance} />
            <VenueMap performance={performance} />
            <section>
              <h3 className="text-muted mb-1.5 text-xs font-semibold">
                {t('performance.schedule')}
              </h3>
              <PerformanceSchedule performance={performance} />
            </section>
          </div>
        </>
      )}
    </Modal>
  )
}
