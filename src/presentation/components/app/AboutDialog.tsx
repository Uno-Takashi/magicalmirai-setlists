import { FaGithub, FaXTwitter } from 'react-icons/fa6'
import { ExternalLink } from '@/presentation/components/ui/ExternalLink'
import { Modal, ModalHeader, ModalSection } from '@/presentation/components/ui/Modal'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import type { TranslationKey } from '@/infrastructure/i18n/i18n'

/** サイトの管理者。 */
const AUTHOR = { name: 'U-Not', x: 'https://x.com/U_Not_401' }

/** このサイトのリポジトリ。 */
const REPOSITORY = {
  name: 'Uno-Takashi/magicalmirai-setlists',
  url: 'https://github.com/Uno-Takashi/magicalmirai-setlists',
}

const SOURCES: { key: TranslationKey; url: string }[] = [
  { key: 'about.source.official', url: 'https://magicalmirai.com/' },
  { key: 'about.source.wiki', url: 'https://w.atwiki.jp/hmiku/pages/56548.html' },
]

/** サイトの説明・使い方・データ出典をまとめたモーダル。 */
export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLocale()

  return (
    <Modal open={open} onClose={onClose} label={t('about.title')}>
      <ModalHeader
        title={t('about.title')}
        tone="accent"
        onClose={onClose}
        closeLabel={t('about.close')}
      />

      <p className="mt-2 text-sm leading-relaxed">{t('about.description')}</p>

      <ModalSection title={t('about.data.title')}>
        <p className="text-muted text-sm leading-relaxed">{t('about.data.description')}</p>
      </ModalSection>

      <ModalSection title={t('about.author')}>
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
      </ModalSection>

      <ModalSection title={t('about.sourceCode')}>
        <ExternalLink href={REPOSITORY.url} icon={<FaGithub aria-hidden className="shrink-0" />}>
          {REPOSITORY.name}
        </ExternalLink>
      </ModalSection>

      <ModalSection title={t('about.sources')}>
        <ul className="grid gap-1.5">
          {SOURCES.map(({ key, url }) => (
            <li key={key}>
              <ExternalLink href={url}>{t(key)}</ExternalLink>
            </li>
          ))}
        </ul>
      </ModalSection>

      <p className="text-muted mt-5 text-xs leading-relaxed">{t('about.disclaimer')}</p>
    </Modal>
  )
}
