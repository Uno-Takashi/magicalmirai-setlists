import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { FaGithub, FaXTwitter } from 'react-icons/fa6'
import { LuExternalLink, LuX } from 'react-icons/lu'
import { useOverlay } from '@/presentation/hooks/useOverlay'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import type { TranslationKey } from '@/infrastructure/i18n/i18n'

/** サイトの管理者。 */
const AUTHOR = { name: 'U-Not', x: 'https://x.com/U_Not_401' }

/** このサイトのリポジトリ。 */
const REPOSITORY = {
  name: 'Uno-Takashi/magicalmirai_setlist_page',
  url: 'https://github.com/Uno-Takashi/magicalmirai_setlist_page',
}

const SOURCES: { key: TranslationKey; url: string }[] = [
  { key: 'about.source.official', url: 'https://magicalmirai.com/' },
  { key: 'about.source.wiki', url: 'https://w.atwiki.jp/hmiku/pages/56548.html' },
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-1.5 text-xs font-bold tracking-wide uppercase">{title}</h3>
      {children}
    </section>
  )
}

/** サイトの説明・使い方・データ出典をまとめたモーダル。 */
export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLocale()
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
            aria-label={t('about.title')}
            className="surface-card max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-5 shadow-2xl sm:rounded-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <h2 className="text-miku min-w-0 flex-1 text-lg font-black">{t('about.title')}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('about.close')}
                className="text-muted shrink-0 rounded-lg p-1.5 transition hover:bg-black/5"
              >
                <LuX />
              </button>
            </div>

            <p className="mt-2 text-sm leading-relaxed">{t('about.description')}</p>

            <Section title={t('about.data.title')}>
              <p className="text-muted text-sm leading-relaxed">{t('about.data.description')}</p>
            </Section>

            <Section title={t('about.author')}>
              <p className="flex items-center gap-2 text-sm">
                <span>{AUTHOR.name}</span>
                <a
                  href={AUTHOR.x}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t('a11y.authorOnX', { name: AUTHOR.name })}
                  className="text-muted rounded p-1 transition hover:bg-black/5"
                >
                  <FaXTwitter />
                </a>
              </p>
            </Section>

            <Section title={t('about.sourceCode')}>
              <a
                href={REPOSITORY.url}
                target="_blank"
                rel="noreferrer"
                className="surface-card flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <FaGithub aria-hidden className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{REPOSITORY.name}</span>
                <LuExternalLink aria-hidden className="text-muted shrink-0 text-xs" />
              </a>
            </Section>

            <Section title={t('about.sources')}>
              <ul className="grid gap-1.5">
                {SOURCES.map(({ key, url }) => (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="surface-card flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span className="min-w-0 flex-1 truncate">{t(key)}</span>
                      <LuExternalLink aria-hidden className="text-muted shrink-0 text-xs" />
                    </a>
                  </li>
                ))}
              </ul>
            </Section>

            <p className="text-muted mt-5 text-xs leading-relaxed">{t('about.disclaimer')}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
