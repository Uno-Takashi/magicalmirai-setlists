import { usePreferences } from '@/presentation/providers/PreferencesProvider'
import { editionThemeOf, type EditionTheme } from './editionThemes'

/**
 * その開催回の配色。表に無い年と、シンプルな表示を選んでいるときは undefined。
 *
 * 背景 (`EditionPage`) と見出しの色 (`EditionView`) の 2 か所が同じ判断を要る。
 * どちらも表を直に引くと、設定を見るのを片方で忘れて片側だけ色が残る。
 */
export function useEditionTheme(slug: string): EditionTheme | undefined {
  const { plainDesign } = usePreferences()
  return plainDesign ? undefined : editionThemeOf(slug)
}
