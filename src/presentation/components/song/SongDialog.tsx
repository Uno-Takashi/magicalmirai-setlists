import { LuPictureInPicture2 } from 'react-icons/lu'
import { editionsOfSong, singersOfSong } from '@/application/searchSongs'
import { producerLabel, type Song } from '@/domain/song/Song'
import { EditionYearBadge } from '@/presentation/components/edition/EditionYearBadge'
import { MusicServiceLinks } from '@/presentation/components/song/MusicServiceLinks'
import { YoutubePreview } from '@/presentation/components/song/YoutubePreview'
import { Modal, ModalHeader, ModalIconButton } from '@/presentation/components/ui/Modal'
import { VocaloidChips } from '@/presentation/components/vocaloid/VocaloidChips'
import { useCatalog } from '@/presentation/providers/CatalogProvider'
import { useLocale } from '@/presentation/providers/LocaleProvider'
import { usePlayer } from '@/presentation/providers/PlayerProvider'

/** その曲を歌ったボーカロイド。年ごとに違うことがあるので、全公演の和集合を出す。 */
function SongSingers({ song }: { song: Song }) {
  const { catalog, searchIndex } = useCatalog()
  return <VocaloidChips singers={singersOfSong(catalog, searchIndex, song.title)} />
}

/** その曲が演奏された開催回。年が並ぶだけで意味が通るので見出しは置かない。 */
function PerformedEditions({
  song,
  onSelectEdition,
}: {
  song: Song
  onSelectEdition: (slug: string) => void
}) {
  const { searchIndex } = useCatalog()
  const editions = editionsOfSong(searchIndex, song.title)
  if (editions.length === 0) return null

  return (
    <ul className="mt-1.5 flex flex-wrap gap-1">
      {editions.map((edition) => (
        <li key={edition.slug}>
          <EditionYearBadge year={edition.year} onSelect={() => onSelectEdition(edition.slug)} />
        </li>
      ))}
    </ul>
  )
}

export function SongDialog({
  song,
  onClose,
  onSelectEdition,
}: {
  song: Song | null
  onClose: () => void
  /** 年のバッジから、その年のセットリストへ移動する。 */
  onSelectEdition: (slug: string) => void
}) {
  const { t } = useLocale()
  const { song: playing, stop } = usePlayer()
  const inPictureInPicture = playing !== null && playing.title === song?.title

  // 閉じる操作 (× / 背景 / Escape) では再生も終える。
  // 右下に残したいときは PinP ボタンを押す、という役割分担にしている。
  const close = () => {
    if (inPictureInPicture) stop()
    onClose()
  }

  return (
    <Modal open={song !== null} onClose={close} label={song?.title ?? ''}>
      {song === null ? null : (
        <>
          <ModalHeader
            className="mb-4"
            title={song.title}
            onClose={close}
            closeLabel={t('song.close')}
            actions={
              // 再生中だけ出す。押すと詳細を閉じ、動画は右下に残る。
              inPictureInPicture ? (
                <ModalIconButton label={t('a11y.pictureInPicture')} onClick={onClose}>
                  <LuPictureInPicture2 />
                </ModalIconButton>
              ) : null
            }
          >
            {song.producers.length > 0 ? (
              <p className="text-muted mt-0.5 text-sm">{producerLabel(song)}</p>
            ) : null}
            <PerformedEditions song={song} onSelectEdition={onSelectEdition} />
            <div className="mt-2">
              <SongSingers song={song} />
            </div>
          </ModalHeader>

          <YoutubePreview song={song} />
          <MusicServiceLinks song={song} />
        </>
      )}
    </Modal>
  )
}
