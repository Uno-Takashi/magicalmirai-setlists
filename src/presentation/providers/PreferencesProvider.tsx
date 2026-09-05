import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { readPlainDesign, writePlainDesign } from '@/infrastructure/preferences/plainDesign'
import { readCompactTags, writeCompactTags } from '@/infrastructure/preferences/tagDisplay'

/**
 * 見た目の好み。設定モーダルで切り替え、次に来たときも同じ見え方になるよう
 * 端末に覚えさせる。
 *
 * 増えるならここに足していく。
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
  /**
   * 開催回ごとの配色をやめて、素の見た目で出すか。
   *
   * true にすると、年ごとの背景と見出しの色を敷かなくなる。飾りより中身を
   * 落ち着いて読みたい人のための設定。
   */
  readonly plainDesign: boolean
  setPlainDesign: (plain: boolean) => void
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [compactTags, setCompactTagsState] = useState(readCompactTags)
  const [plainDesign, setPlainDesignState] = useState(readPlainDesign)

  const setCompactTags = useCallback((compact: boolean) => {
    setCompactTagsState(compact)
    writeCompactTags(compact)
  }, [])

  const setPlainDesign = useCallback((plain: boolean) => {
    setPlainDesignState(plain)
    writePlainDesign(plain)
  }, [])

  const value = useMemo<PreferencesValue>(
    () => ({ compactTags, setCompactTags, plainDesign, setPlainDesign }),
    [compactTags, setCompactTags, plainDesign, setPlainDesign],
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
