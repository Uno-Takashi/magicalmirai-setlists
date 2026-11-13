import { createContext } from 'react'
import type { Song } from '@/domain/song/Song'
import { useRequiredContext } from './requiredContext'

/**
 * 再生中の 1 曲を、画面のどこよりも上で持つ。
 *
 * iframe は親要素を移すと読み込み直しになり、再生が止まってしまう。
 * そのため動画の実体は `FloatingPlayer` が 1 つだけ持ち続け、曲の詳細は
 * 「ここに置いてほしい」という場所 (slot) を貸すだけにしている。
 * これで詳細を閉じても再生は途切れず、そのまま右下へ移せる。
 */
export interface PlayerContextValue {
  /** 再生中の曲。null なら何も鳴っていない。 */
  readonly song: Song | null
  /** 動画を重ねる場所。曲の詳細が開いている間だけ入る。 */
  readonly slot: HTMLElement | null
  play: (song: Song) => void
  stop: () => void
  /** 曲の詳細から場所を貸す。ref コールバックとしてそのまま渡す。 */
  dock: (element: HTMLElement | null) => void
}

export const PlayerContext = createContext<PlayerContextValue | null>(null)

export function usePlayer(): PlayerContextValue {
  return useRequiredContext(PlayerContext, 'usePlayer')
}
