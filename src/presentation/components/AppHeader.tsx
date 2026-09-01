import { LuChartColumn, LuInfo, LuSearch, LuSettings } from 'react-icons/lu'
import { HOME_URL } from '@/presentation/hooks/useRoute'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { AppLogo } from './AppLogo'

export function AppHeader({
  onNavigateHome,
  onOpenSearch,
  onOpenStatistics,
  onOpenAbout,
  onOpenSettings,
}: {
  onNavigateHome: () => void
  onOpenSearch: () => void
  onOpenStatistics: () => void
  onOpenAbout: () => void
  onOpenSettings: () => void
}) {
  const { t } = useLocale()

  const iconButton = 'surface-card rounded-lg p-2 transition hover:-translate-y-0.5 hover:shadow-md'

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-3">
      <h1 className="min-w-0 flex-1">
        {/*
          実際の href を持つアンカーにして、新しいタブで開く・リンクをコピーするといった
          ブラウザ本来の操作を残す。修飾キー無しの左クリックだけ SPA 内で遷移させる。
        */}
        <a
          href={HOME_URL}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            event.preventDefault()
            onNavigateHome()
          }}
          className="text-miku flex min-w-0 items-center gap-2 transition hover:opacity-70"
        >
          {/* マークはタイトルの文言と同じことを指すので、読み上げからは外す。 */}
          <AppLogo className="size-8 shrink-0" />
          {/*
            狭い画面ではマークだけにする。切り詰めても折り返しても読めないため。
            display:none で消すと、このリンクと h1 が読み上げ名を失う。
            sr-only は見た目だけを消して名前を残すので、こちらを使う。
          */}
          <span className="sr-only leading-tight font-black text-balance sm:not-sr-only sm:text-lg">
            {t('app.title')}
          </span>
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

      <button
        type="button"
        onClick={onOpenSettings}
        aria-label={t('settings.open')}
        className={iconButton}
      >
        <LuSettings />
      </button>
    </header>
  )
}
