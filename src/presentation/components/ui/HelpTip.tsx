import { Tooltip } from '@heroui/react'
import { LuCircleHelp } from 'react-icons/lu'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 見出しの横に置く「?」。マウスオーバーで説明を出す。
 *
 * 説明は常時表示すると画面が説明文だらけになるので、知りたい人だけが開ける形にしている。
 */
export function HelpTip({ text }: { text: string }) {
  const { t } = useLocale()

  return (
    <Tooltip>
      {/* トリガー自体をボタンとして描画する。既定の div だと入れ子の役割がおかしくなる。 */}
      <Tooltip.Trigger<'button'>
        render={(triggerProps) => (
          <button
            {...triggerProps}
            type="button"
            aria-label={t('a11y.help')}
            className="text-muted inline-grid size-4 place-items-center rounded-full align-middle transition hover:bg-black/[0.06]"
          />
        )}
      >
        <LuCircleHelp className="size-3.5" aria-hidden />
      </Tooltip.Trigger>
      <Tooltip.Content className="max-w-64 text-xs leading-relaxed">{text}</Tooltip.Content>
    </Tooltip>
  )
}
