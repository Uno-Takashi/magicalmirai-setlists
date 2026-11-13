import { useMemo, useState, type ReactNode } from 'react'
import type { Song } from '@/domain/song/Song'
import {
  DialogsActionsContext,
  DialogsStateContext,
  type DialogsActions,
  type DialogsState,
} from './DialogsContext'

export function DialogsProvider({ children }: { children: ReactNode }) {
  const [song, setSong] = useState<Song | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [favoritesOpen, setFavoritesOpen] = useState(false)
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
      openFavorites: () => setFavoritesOpen(true),
      closeFavorites: () => setFavoritesOpen(false),
      openAbout: () => setAboutOpen(true),
      closeAbout: () => setAboutOpen(false),
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      closeAll: () => {
        setSong(null)
        setSearchOpen(false)
        setFavoritesOpen(false)
        setAboutOpen(false)
        setSettingsOpen(false)
      },
    }),
    [],
  )

  const state = useMemo<DialogsState>(
    () => ({ song, searchOpen, searchQuery, favoritesOpen, aboutOpen, settingsOpen }),
    [song, searchOpen, searchQuery, favoritesOpen, aboutOpen, settingsOpen],
  )

  return (
    <DialogsActionsContext value={actions}>
      <DialogsStateContext value={state}>{children}</DialogsStateContext>
    </DialogsActionsContext>
  )
}
