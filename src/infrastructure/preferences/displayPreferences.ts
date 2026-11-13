/**
 * 見た目の好み (設定モーダルのスイッチ) を端末に覚える。
 *
 * どれも「既定は off、選んだら on」の真偽値なので、保存の形を 1 つにそろえる。
 */

import { readStoredItem, writeStoredItem } from '@/infrastructure/storage/safeLocalStorage'

export interface BooleanPreference {
  /** 前回の選択。保存が無い・読めない場合は false (既定)。 */
  read: () => boolean
  write: (value: boolean) => void
}

function booleanPreference(key: string): BooleanPreference {
  return {
    read: () => readStoredItem(key) === 'true',
    write: (value) => writeStoredItem(key, String(value)),
  }
}

/** タグを目印だけに畳む。 */
export const compactTagsPreference = booleanPreference('mm-compact-tags')

/** 開催回ごとの配色をやめて素の見た目にする。 */
export const plainDesignPreference = booleanPreference('mm-plain-design')
