import { createContext, use, useMemo, useState, type ReactNode } from 'react'
import type { Song } from '@/domain/song/Song'

/**
 * 画面に重ねるもの (検索・曲の詳細・About・設定) の開閉。
 *
 * 開く操作はヘッダー・セットリストの行・統計の行と画面中に散っているのに対し、
 * 開いているかどうかを知りたいのは重なりを描く `AppOverlays` だけ。
 * そこで「状態」と「操作」を別の文脈に分け、操作だけを使う側が状態の変化で
 * 描き直されないようにしている (曲の詳細を開いてもセットリストは描き直さない)。
 */
interface DialogsState {
  /** 詳細を出している曲。null なら閉じている。 */
  readonly song: Song | null
  readonly searchOpen: boolean
  /** 検索を開くときに入れておく語。ボカロ P の行から飛んで来たときだけ空でない。 */
  readonly searchQuery: string
  readonly aboutOpen: boolean
  readonly settingsOpen: boolean
}

interface DialogsActions {
  showSong: (song: Song) => void
  closeSong: () => void
  /** 語を渡すと、その語を入れた状態で検索を開く。 */
  openSearch: (query?: string) => void
  closeSearch: () => void
  openAbout: () => void
  closeAbout: () => void
  openSettings: () => void
  closeSettings: () => void
  /** 重なっているものをすべて閉じる。裏の画面へ移るときに使う。 */
  closeAll: () => void
}

const DialogsStateContext = createContext<DialogsState | null>(null)
const DialogsActionsContext = createContext<DialogsActions | null>(null)

export function DialogsProvider({ children }: { children: ReactNode }) {
  const [song, setSong] = useState<Song | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // 操作は一度作ったら変えない。深いところで使うので、同一性が変わると
  // 受け取り側の効果や memo がそのたびに無効になる。
  const actions = useMemo<DialogsActions>(
    () => ({
      showSong: setSong,
      closeSong: () => setSong(null),
      openSearch: (query = '') => {
        setSearchQuery(query)
        setSearchOpen(true)
      },
      closeSearch: () => setSearchOpen(false),
      openAbout: () => setAboutOpen(true),
      closeAbout: () => setAboutOpen(false),
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      closeAll: () => {
        setSong(null)
        setSearchOpen(false)
        setAboutOpen(false)
        setSettingsOpen(false)
      },
    }),
    [],
  )

  const state = useMemo<DialogsState>(
    () => ({ song, searchOpen, searchQuery, aboutOpen, settingsOpen }),
    [song, searchOpen, searchQuery, aboutOpen, settingsOpen],
  )

  return (
    <DialogsActionsContext value={actions}>
      <DialogsStateContext value={state}>{children}</DialogsStateContext>
    </DialogsActionsContext>
  )
}

export function useDialogsState(): DialogsState {
  const value = use(DialogsStateContext)
  if (value === null) throw new Error('DialogsProvider の外で useDialogsState を呼び出しています')
  return value
}

export function useDialogs(): DialogsActions {
  const value = use(DialogsActionsContext)
  if (value === null) throw new Error('DialogsProvider の外で useDialogs を呼び出しています')
  return value
}
