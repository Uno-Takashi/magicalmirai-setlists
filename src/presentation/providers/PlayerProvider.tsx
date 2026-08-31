import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Song } from '@/domain/song/Song'

/**
 * 再生中の 1 曲を、画面のどこよりも上で持つ。
 *
 * iframe は親要素を移すと読み込み直しになり、再生が止まってしまう。
 * そのため動画の実体は `FloatingPlayer` が 1 つだけ持ち続け、曲の詳細は
 * 「ここに置いてほしい」という場所 (slot) を貸すだけにしている。
 * これで詳細を閉じても再生は途切れず、そのまま右下へ移せる。
 */
interface PlayerContextValue {
  /** 再生中の曲。null なら何も鳴っていない。 */
  readonly song: Song | null
  /** 動画を重ねる場所。曲の詳細が開いている間だけ入る。 */
  readonly slot: HTMLElement | null
  play: (song: Song) => void
  stop: () => void
  /** 曲の詳細から場所を貸す。ref コールバックとしてそのまま渡す。 */
  dock: (element: HTMLElement | null) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

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

  const play = useCallback((next: Song) => setSong(next), [])
  const stop = useCallback(() => setSong(null), [])
  const dock = useCallback((element: HTMLElement | null) => setSlot(element), [])

  const value = useMemo<PlayerContextValue>(
    () => ({ song, slot, play, stop, dock }),
    [song, slot, play, stop, dock],
  )
  return <PlayerContext value={value}>{children}</PlayerContext>
}

export function usePlayer(): PlayerContextValue {
  const value = use(PlayerContext)
  if (value === null) throw new Error('PlayerProvider の外で usePlayer を呼び出しています')
  return value
}
