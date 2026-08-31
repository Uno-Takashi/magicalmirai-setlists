import { useEffect } from 'react'

/**
 * Ctrl+F (macOS は ⌘+F) で曲名検索を開く。
 *
 * ブラウザ標準のページ内検索を置き換える。このサイトは今見ている開催回だけを
 * 描画するので、標準の検索では他の年の曲に当たらない。全開催回を横断できる
 * 自前の検索へ寄せたほうが、利用者の期待に近い。
 *
 * 検索欄そのものにフォーカスがあっても効かせる。既に開いていれば開き直すだけで、
 * 標準の検索窓が重なって出るのを防げる。
 */
export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'f' && event.key !== 'F') return
      if (event.altKey || !(event.ctrlKey || event.metaKey)) return
      event.preventDefault()
      onOpen()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpen])
}
