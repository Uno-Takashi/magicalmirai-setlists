import { Switch } from '@heroui/react'
import { LOCALE_LABELS, LOCALES } from '@/infrastructure/i18n/i18n'
import { Modal, ModalHeader, ModalSection } from '@/presentation/components/ui/Modal'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { usePreferences } from '@/presentation/providers/PreferencesProvider'

/** 見た目の好みを 1 つ切り替える行。説明はスイッチの下に小さく添える。 */
function SettingRow({
  label,
  description,
  selected,
  onChange,
}: {
  label: string
  description: string
  selected: boolean
  onChange: (selected: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-muted mt-0.5 text-xs leading-relaxed">{description}</p>
      </div>
      {/* ラベルは左に見えているので、スイッチ自身は読み上げ名だけ持たせる */}
      <Switch aria-label={label} isSelected={selected} onChange={onChange} className="shrink-0">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
      </Switch>
    </div>
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
  const { compactTags, setCompactTags, plainDesign, setPlainDesign } = usePreferences()

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

      <ModalSection title={t('settings.display')}>
        <div className="grid gap-4">
          <SettingRow
            label={t('settings.compactTags.label')}
            description={t('settings.compactTags.description')}
            selected={compactTags}
            onChange={setCompactTags}
          />
          <SettingRow
            label={t('settings.plainDesign.label')}
            description={t('settings.plainDesign.description')}
            selected={plainDesign}
            onChange={setPlainDesign}
          />
        </div>
      </ModalSection>
    </Modal>
  )
}
