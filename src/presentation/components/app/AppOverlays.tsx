import { useCallback } from 'react'
import type { Song } from '@/domain/song/Song'
import { AboutDialog } from '@/presentation/components/app/AboutDialog'
import { SettingsDialog } from '@/presentation/components/app/SettingsDialog'
import { FavoritesOverlay } from '@/presentation/components/song/FavoritesOverlay'
import { FloatingPlayer } from '@/presentation/components/song/FloatingPlayer'
import { SearchOverlay } from '@/presentation/components/song/SearchOverlay'
import { SongDialog } from '@/presentation/components/song/SongDialog'
import { useDialogs, useDialogsState } from '@/presentation/providers/DialogsProvider'
import { useNavigation } from '@/presentation/providers/NavigationProvider'

/**
 * 画面に重ねるものをまとめて描く。どのページでも同じように重なるので、
 * ページの切り替えより外側に置く。
 *
 * 「重なりを閉じる」と「年へ移る」をつなぐのもここ。開閉 (`DialogsProvider`) と
 * 現在地 (`NavigationProvider`) はそれぞれ独立していて、両方を知るのはこの場所だけ。
 */
export function AppOverlays() {
  const { song, searchOpen, searchQuery, favoritesOpen, aboutOpen, settingsOpen } =
    useDialogsState()
  const { showSong, closeSong, closeSearch, closeFavorites, closeAbout, closeSettings, closeAll } =
    useDialogs()
  const { selectEdition, showSongInEdition } = useNavigation()

  /** 曲の詳細の年バッジから移る。遷移先が見えるよう、重なりはすべて閉じる。 */
  const selectEditionFromSong = useCallback(
    (slug: string) => {
      const title = song?.title
      closeAll()
      if (title === undefined) selectEdition(slug)
      else showSongInEdition(slug, title)
    },
    [closeAll, selectEdition, showSongInEdition, song],
  )

  /** 検索やお気に入りの年の札から移る。重なりを閉じて、その年を見せる。 */
  const selectEditionFromList = useCallback(
    (slug: string) => {
      closeSearch()
      closeFavorites()
      selectEdition(slug)
    },
    [closeFavorites, closeSearch, selectEdition],
  )

  const expandPlayer = useCallback((playing: Song) => showSong(playing), [showSong])

  return (
    <>
      <SearchOverlay
        open={searchOpen}
        initialQuery={searchQuery}
        onClose={closeSearch}
        onSelectSong={showSong}
        onSelectEdition={selectEditionFromList}
      />
      <FavoritesOverlay
        open={favoritesOpen}
        onClose={closeFavorites}
        onSelectSong={showSong}
        onSelectEdition={selectEditionFromList}
      />
      <SongDialog song={song} onClose={closeSong} onSelectEdition={selectEditionFromSong} />
      <AboutDialog open={aboutOpen} onClose={closeAbout} />
      <SettingsDialog open={settingsOpen} onClose={closeSettings} />
      {/* 詳細を閉じても再生を続けるので、どの画面でも描いておく。 */}
      <FloatingPlayer onExpand={expandPlayer} />
    </>
  )
}
