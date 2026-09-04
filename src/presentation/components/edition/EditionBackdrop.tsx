import { EditionMotifArt } from './EditionMotifArt'
import type { EditionTheme } from './editionThemes'

/**
 * 開催回の背景。その年の色を敷き、モチーフがあれば薄く散らす。
 *
 * 年送りのスライドと一緒に動かしたいので、画面ではなく開催回の中身
 * (`EditionView` の section) の中に置く。中身より先に描かれるだけで、
 * z-index は使わない (本文側が `relative` なので、そのまま上に乗る)。
 *
 * 読み上げからは外す。色もヒマワリも飾りで、文字の情報を足さない。
 */
export function EditionBackdrop({ theme }: { theme: EditionTheme }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        // 色の移り変わりは上から 60rem までで終わらせ、その先は最後の色で塗る。
        // 高さいっぱいに引き伸ばすと、曲数の多い年ほど変化が薄まって単色に見える。
        backgroundColor: theme.colors[theme.colors.length - 1],
        backgroundImage: `linear-gradient(to bottom, ${theme.colors.join(', ')})`,
        backgroundSize: '100% 60rem',
        backgroundRepeat: 'no-repeat',
        // 下端は脚注の地色へ溶かす。敷き終わりに横線が出ないようにする。
        maskImage: 'linear-gradient(to bottom, #000 calc(100% - 6rem), transparent)',
      }}
    >
      {theme.motif !== undefined ? <EditionMotifArt motif={theme.motif} /> : null}
    </div>
  )
}
