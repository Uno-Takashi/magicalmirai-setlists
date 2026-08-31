import { useLocale } from '@/presentation/providers/LocaleProvider'

export function AppFooter() {
  const { t } = useLocale()

  return (
    <footer className="text-muted mx-auto w-full max-w-3xl px-4 py-8 text-xs">
      <p>{t('footer.disclaimer')}</p>
    </footer>
  )
}
