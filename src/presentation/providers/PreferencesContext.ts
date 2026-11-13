import { createContext } from 'react'
import { useRequiredContext } from './requiredContext'

/**
 * 見た目の好み。設定モーダルで切り替え、次に来たときも同じ見え方になるよう
 * 端末に覚えさせる。
 */
export interface PreferencesContextValue {
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

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function usePreferences(): PreferencesContextValue {
  return useRequiredContext(PreferencesContext, 'usePreferences')
}
