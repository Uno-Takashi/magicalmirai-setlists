import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Song } from '@/domain/song/Song'
import { PlayerContext, type PlayerContextValue } from './PlayerContext'

export function PlayerProvider({
  children,
  initialSong = null,
}: {
  children: ReactNode
  /** ストーリーから再生中の状態を作るためのもの。アプリ本体では使わない。 */
  initialSong?: Song | null
}) {
  const [song, setSong] = useState<Song | null>(initialSong)
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  const stop = useCallback(() => setSong(null), [])

  // play と dock は state の setter そのもの。setter は同一性が変わらない
  const value = useMemo<PlayerContextValue>(
    () => ({ song, slot, play: setSong, stop, dock: setSlot }),
    [song, slot, stop],
  )
  return <PlayerContext value={value}>{children}</PlayerContext>
}
