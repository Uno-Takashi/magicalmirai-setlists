import { LOCALE_LABELS, LOCALES } from '@/infrastructure/i18n/i18n'
import { Modal, ModalHeader, ModalSection } from '@/presentation/components/ui/Modal'
import { useLocale } from '@/presentation/providers/LocaleProvider'

/**
 * 表示の設定をまとめたモーダル。今は言語だけだが、設定はここに足していく。
 *
 * 言語は select ではなく候補を並べたボタンにする。選べる言語がその場で全部見え、
 * それぞれの名前がその言語自身の表記で読めるため。
 */
export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale, setLocale } = useLocale()

  return (
    <Modal open={open} onClose={onClose} label={t('settings.title')} width="sm">
      <ModalHeader
        title={t('settings.title')}
        tone="accent"
        onClose={onClose}
        closeLabel={t('settings.close')}
      />

      <ModalSection title={t('locale.select')}>
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
      </ModalSection>
    </Modal>
  )
}
