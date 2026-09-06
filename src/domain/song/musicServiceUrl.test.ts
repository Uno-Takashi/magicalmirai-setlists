/**
 * 「正確な URL が無ければ検索に落とす」というドメインの意思決定を固定する。
 * 存在しないリンクを出さないためのポリシーなので、落とし方まで含めて確かめる。
 */

import { describe, expect, it } from 'vitest'
import type { Song, SongLinks } from './Song'
import { canEmbed, musicServiceLink, youtubeEmbedUrl, youtubeThumbnailUrl } from './musicServiceUrl'

function song(links: SongLinks, producers: readonly string[] = ['サンプルP']): Song {
  return { title: 'ネオンの通学路', producers, singers: ['miku'], links }
}

describe('musicServiceLink', () => {
  it('YouTube の動画 ID があれば、その動画への正確なリンクを返す', () => {
    expect(musicServiceLink(song({ youtube: 'abc123' }), 'youtube')).toEqual({
      kind: 'youtube',
      url: 'https://www.youtube.com/watch?v=abc123',
      exact: true,
    })
  })

  it('Spotify と Apple Music は、データセットの URL をそのまま使う', () => {
    const links = { spotify: 'https://open.spotify.com/track/x', appleMusic: 'https://ex.test/y' }
    expect(musicServiceLink(song(links), 'spotify')).toMatchObject({
      url: links.spotify,
      exact: true,
    })
    expect(musicServiceLink(song(links), 'appleMusic')).toMatchObject({
      url: links.appleMusic,
      exact: true,
    })
  })

  it('リンクが無ければ、曲名と作曲者で検索する URL に落とす', () => {
    const link = musicServiceLink(song({}), 'youtube')
    expect(link.exact).toBe(false)
    expect(link.url).toBe(
      'https://www.youtube.com/results?search_query=' +
        encodeURIComponent('ネオンの通学路 サンプルP'),
    )
  })

  it('検索語は URL に載せられる形に符号化する', () => {
    // 曲名の空白や記号がそのまま出ると、URL として壊れる
    const link = musicServiceLink(song({}), 'spotify')
    expect(link.url).not.toContain(' ')
    expect(link.url.startsWith('https://open.spotify.com/search/')).toBe(true)
  })

  it('作曲者が不明な曲は、曲名だけで検索する', () => {
    const link = musicServiceLink(song({}, []), 'appleMusic')
    expect(link.url).toBe(
      'https://music.apple.com/jp/search?term=' + encodeURIComponent('ネオンの通学路'),
    )
  })

  it('合作は作曲者を × でつないで検索語にする', () => {
    const link = musicServiceLink(song({}, ['サンプルP', 'モックP']), 'youtube')
    expect(decodeURIComponent(link.url)).toContain('サンプルP×モックP')
  })
})

describe('youtubeEmbedUrl', () => {
  it('押されてから作るので自動再生を付ける', () => {
    expect(youtubeEmbedUrl('abc123')).toContain('autoplay=1')
  })

  it('再生の終わりを親ページが受け取れるよう、JS API を有効にする', () => {
    expect(youtubeEmbedUrl('abc123')).toContain('enablejsapi=1')
  })

  it('動画 ID を埋め込みの経路に載せる', () => {
    expect(youtubeEmbedUrl('abc123').startsWith('https://www.youtube.com/embed/abc123?')).toBe(true)
  })
})

describe('youtubeThumbnailUrl', () => {
  it('動画 ID からサムネイルの URL を組み立てる', () => {
    expect(youtubeThumbnailUrl('abc123')).toBe('https://i.ytimg.com/vi/abc123/hqdefault.jpg')
  })
})

describe('canEmbed', () => {
  it('YouTube の動画 ID がある曲だけ埋め込み再生できる', () => {
    expect(canEmbed(song({ youtube: 'abc123' }))).toBe(true)
    expect(canEmbed(song({}))).toBe(false)
  })

  it('Spotify だけがあっても埋め込み再生はできない', () => {
    expect(canEmbed(song({ spotify: 'https://open.spotify.com/track/x' }))).toBe(false)
  })
})
