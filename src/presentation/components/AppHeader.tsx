import { useId } from 'react'
import { LuChartColumn, LuInfo, LuSearch } from 'react-icons/lu'
import { LOCALE_LABELS, LOCALES, isLocale } from '@/infrastructure/i18n/i18n'
import { HOME_URL } from '@/presentation/hooks/useRoute'
import { useLocale } from '@/presentation/providers/LocaleProvider'

export function AppHeader({
  onNavigateHome,
  onOpenSearch,
  onOpenStatistics,
  onOpenAbout,
}: {
  onNavigateHome: () => void
  onOpenSearch: () => void
  onOpenStatistics: () => void
  onOpenAbout: () => void
}) {
  const { t, locale, setLocale } = useLocale()
  // Storybook のように 1 ページへ複数並ぶことがあるので、id は固定値にしない
  const localeSelectId = useId()

  const iconButton = 'surface-card rounded-lg p-2 transition hover:-translate-y-0.5 hover:shadow-md'

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-3">
      <h1 className="min-w-0 flex-1">
        {/*
          実際の href を持つアンカーにして、新しいタブで開く・リンクをコピーするといった
          ブラウザ本来の操作を残す。修飾キー無しの左クリックだけ SPA 内で遷移させる。
          狭い画面では折り返す。切り詰めるとタイトルが読めなくなる。
        */}
        <a
          href={HOME_URL}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            event.preventDefault()
            onNavigateHome()
          }}
          className="text-miku block text-sm leading-tight font-black text-balance transition hover:opacity-70 sm:text-lg"
        >
          {t('app.title')}
        </a>
      </h1>

      <button
        type="button"
        onClick={onOpenSearch}
        aria-label={t('search.open')}
        className={iconButton}
      >
        <LuSearch />
      </button>

      <button
        type="button"
        onClick={onOpenStatistics}
        aria-label={t('statistics.open')}
        className={iconButton}
      >
        <LuChartColumn />
      </button>

      <button
        type="button"
        onClick={onOpenAbout}
        aria-label={t('about.open')}
        className={iconButton}
      >
        <LuInfo />
      </button>

      <label className="sr-only" htmlFor={localeSelectId}>
        {t('locale.select')}
      </label>
      <select
        id={localeSelectId}
        value={locale}
        onChange={(event) => {
          if (isLocale(event.target.value)) setLocale(event.target.value)
        }}
        className="surface-card rounded-lg px-2 py-2 text-xs"
      >
        {LOCALES.map((value) => (
          <option key={value} value={value}>
            {LOCALE_LABELS[value]}
          </option>
        ))}
      </select>
    </header>
  )
}
