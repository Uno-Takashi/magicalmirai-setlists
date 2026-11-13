import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  compactTagsPreference,
  plainDesignPreference,
} from '@/infrastructure/preferences/displayPreferences'
import { PreferencesContext, type PreferencesContextValue } from './PreferencesContext'

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [compactTags, setCompactTagsState] = useState(compactTagsPreference.read)
  const [plainDesign, setPlainDesignState] = useState(plainDesignPreference.read)

  const setCompactTags = useCallback((compact: boolean) => {
    setCompactTagsState(compact)
    compactTagsPreference.write(compact)
  }, [])

  const setPlainDesign = useCallback((plain: boolean) => {
    setPlainDesignState(plain)
    plainDesignPreference.write(plain)
  }, [])

  const value = useMemo<PreferencesContextValue>(
    () => ({ compactTags, setCompactTags, plainDesign, setPlainDesign }),
    [compactTags, setCompactTags, plainDesign, setPlainDesign],
  )

  return <PreferencesContext value={value}>{children}</PreferencesContext>
}
