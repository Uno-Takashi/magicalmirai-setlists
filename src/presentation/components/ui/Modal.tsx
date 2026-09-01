import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'
import { useOverlay } from '@/presentation/hooks/useOverlay'

/** 中身の最大幅。設定のように項目が少ないものは `sm` で細く見せる。 */
const MAX_WIDTH = { sm: 'max-w-sm', md: 'max-w-lg' } as const

/** 背面と本体の動き。どのモーダルでも同じ出方にする。 */
const BACKDROP = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
const PANEL = {
  initial: { y: 40, opacity: 0, scale: 0.98 },
  animate: { y: 0, opacity: 1, scale: 1 },
  exit: { y: 40, opacity: 0, scale: 0.98 },
  transition: { type: 'spring', stiffness: 320, damping: 30 },
} as const

/**
 * モーダルの外枠。背面・本体・出入りの動き・Escape・背面のスクロール止めを持つ。
 *
 * **必ず body へポータルで出す。** 曲の詳細は年送りのカルーセル
 * (`EditionCarousel`) の内側から呼ばれることがあり、カルーセルはスライドを
 * `motion.div` の `transform` で動かしている。`transform` の掛かった祖先は
 * `position: fixed` の基準になるため、そのままだと `fixed inset-0` が画面ではなく
 * スライドの箱を指し、ページと一緒にスクロールして画面外へ流れてしまう
 * (さらにカルーセルの `overflow-hidden` で切り取られる)。
 */
export function Modal({
  open,
  onClose,
  /** 読み上げ用のモーダルの名前。見出しと同じ文言を渡す。 */
  label,
  width = 'md',
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  width?: keyof typeof MAX_WIDTH
  children: ReactNode
}) {
  useOverlay(open, onClose)

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          {...BACKDROP}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            {...PANEL}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={`surface-card max-h-[85vh] w-full ${MAX_WIDTH[width]} overflow-y-auto rounded-t-2xl p-5 shadow-2xl sm:rounded-2xl`}
            // 本体を押しても閉じない。背面を押したときだけ閉じる。
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

/** 見出しの右に並べるアイコンだけのボタン。閉じる・縮小など、モーダル自身の操作に使う。 */
export function ModalIconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="text-muted rounded-lg p-1.5 transition hover:bg-black/5"
    >
      {children}
    </button>
  )
}

/**
 * モーダルの見出し行。見出しと閉じるボタンを対にして、どのモーダルでも同じ位置に置く。
 *
 * `tone` は見出しの見せ方。サイト全体の話 (About / 設定) はミクの色で見出しらしく、
 * 個々のものの詳細 (曲 / 会場) はその名前をそのまま太字で出す。
 */
export function ModalHeader({
  title,
  tone = 'plain',
  onClose,
  closeLabel,
  actions,
  className,
  children,
}: {
  title: ReactNode
  tone?: 'accent' | 'plain'
  onClose: () => void
  closeLabel: string
  /** 閉じるの左に並べる追加の操作。 */
  actions?: ReactNode
  className?: string
  /** 見出しの下に続ける補足。曲の詳細では作曲者や出演年を置く。 */
  children?: ReactNode
}) {
  return (
    <div className={`flex items-start gap-3 ${className ?? ''}`}>
      <div className="min-w-0 flex-1">
        <h2
          className={
            tone === 'accent'
              ? 'text-miku text-lg font-black'
              : 'text-lg leading-tight font-bold break-words'
          }
        >
          {title}
        </h2>
        {children}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {actions}
        <ModalIconButton label={closeLabel} onClick={onClose}>
          <LuX />
        </ModalIconButton>
      </div>
    </div>
  )
}

/** モーダルの中の節。見出しを小さく置いて、中身をその下にまとめる。 */
export function ModalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-1.5 text-xs font-bold tracking-wide uppercase">{title}</h3>
      {children}
    </section>
  )
}
