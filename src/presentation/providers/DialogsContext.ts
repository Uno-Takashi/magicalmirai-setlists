import { createContext } from 'react'
import type { Song } from '@/domain/song/Song'
import { useRequiredContext } from './requiredContext'

/**
 * 画面に重ねるもの (検索・お気に入り・曲の詳細・About・設定) の開閉。
 *
 * 開く操作はヘッダー・セットリストの行・統計の行と画面中に散っているのに対し、
 * 開いているかどうかを知りたいのは重なりを描く `AppOverlays` だけ。
 * そこで「状態」と「操作」を別の文脈に分け、操作だけを使う側が状態の変化で
 * 描き直されないようにしている (曲の詳細を開いてもセットリストは描き直さない)。
 */
export interface DialogsState {
  /** 詳細を出している曲。null なら閉じている。 */
  readonly song: Song | null
  readonly searchOpen: boolean
  /** 検索を開くときに入れておく語。ボカロ P の行から飛んで来たときだけ空でない。 */
  readonly searchQuery: string
  readonly favoritesOpen: boolean
  readonly aboutOpen: boolean
  readonly settingsOpen: boolean
}

export interface DialogsActions {
  showSong: (song: Song) => void
  closeSong: () => void
  /** 語を渡すと、その語を入れた状態で検索を開く。 */
  openSearch: (query?: string) => void
  closeSearch: () => void
  openFavorites: () => void
  closeFavorites: () => void
  openAbout: () => void
  closeAbout: () => void
  openSettings: () => void
  closeSettings: () => void
  /** 重なっているものをすべて閉じる。裏の画面へ移るときに使う。 */
  closeAll: () => void
}

export const DialogsStateContext = createContext<DialogsState | null>(null)
export const DialogsActionsContext = createContext<DialogsActions | null>(null)

/** 開いているかどうか。重なりを描く側だけが読む。 */
export function useDialogsState(): DialogsState {
  return useRequiredContext(DialogsStateContext, 'useDialogsState')
}

/** 開け閉めの操作。同一性は変わらないので、読んでも描き直しは起きない。 */
export function useDialogs(): DialogsActions {
  return useRequiredContext(DialogsActionsContext, 'useDialogs')
}
