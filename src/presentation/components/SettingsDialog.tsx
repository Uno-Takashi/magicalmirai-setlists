import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { LuX } from 'react-icons/lu'
import { LOCALE_LABELS, LOCALES } from '@/infrastructure/i18n/i18n'
import { useOverlay } from '@/presentation/hooks/useOverlay'
import { useLocale } from '@/presentation/providers/LocaleProvider'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-1.5 text-xs font-bold tracking-wide uppercase">{title}</h3>
      {children}
    </section>
  )
}

/**
 * 表示の設定をまとめたモーダル。今は言語だけだが、設定はここに足していく。
 *
 * 言語は select ではなく候補を並べたボタンにする。選べる言語がその場で全部見え、
 * それぞれの名前がその言語自身の表記で読めるため。
 */
export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale, setLocale } = useLocale()
  useOverlay(open, onClose)

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('settings.title')}
            className="surface-card max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-2xl p-5 shadow-2xl sm:rounded-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <h2 className="text-miku min-w-0 flex-1 text-lg font-black">{t('settings.title')}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('settings.close')}
                className="text-muted shrink-0 rounded-lg p-1.5 transition hover:bg-black/5"
              >
                <LuX />
              </button>
            </div>

            <Section title={t('locale.select')}>
              {/* 言語名は各言語の表記のまま出すので、group の名前は翻訳した見出しから取る */}
              <div role="group" aria-label={t('locale.select')} className="grid gap-1.5">
                {LOCALES.map((value) => {
                  const selected = value === locale
                  return (
                    <button
                      key={value}
                      type="button"
                      lang={value}
                      aria-pressed={selected}
                      onClick={() => setLocale(value)}
                      className={`rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                        selected ? 'bg-miku/15 text-miku' : 'text-muted hover:bg-black/[0.04]'
                      }`}
                    >
                      {LOCALE_LABELS[value]}
                    </button>
                  )
                })}
              </div>
            </Section>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
