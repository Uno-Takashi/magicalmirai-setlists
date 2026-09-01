import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { readCompactTags, writeCompactTags } from '@/infrastructure/preferences/tagDisplay'

/**
 * 見た目の好み。設定モーダルで切り替え、次に来たときも同じ見え方になるよう
 * 端末に覚えさせる。
 *
 * 現在は「タグの省略表示」だけだが、増えるならここに足していく。
 */
interface PreferencesValue {
  /**
   * タグを絵だけに畳むか。
   *
   * true にすると、作曲者以外のタグ (歌唱ボーカロイド・枠のタグ・入れ替わりの軸) は
   * 色の丸やアイコンだけになり、マウスを載せるか焦点が当たったときに文言が開く。
   * 曲名を見渡しやすくするための設定。
   */
  readonly compactTags: boolean
  setCompactTags: (compact: boolean) => void
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [compactTags, setCompactTagsState] = useState(readCompactTags)

  const setCompactTags = useCallback((compact: boolean) => {
    setCompactTagsState(compact)
    writeCompactTags(compact)
  }, [])

  const value = useMemo<PreferencesValue>(
    () => ({ compactTags, setCompactTags }),
    [compactTags, setCompactTags],
  )

  return <PreferencesContext value={value}>{children}</PreferencesContext>
}

export function usePreferences(): PreferencesValue {
  const value = use(PreferencesContext)
  if (value === null) {
    throw new Error('PreferencesProvider の外で usePreferences を呼び出しています')
  }
  return value
}
