import type { ComponentType } from 'react'
import type { EditionMotif } from './editionThemes'
import { CloudMotif } from './motif/CloudMotif'
import { CubeMotif } from './motif/CubeMotif'
import { DotsMotif } from './motif/DotsMotif'
import { LanternMotif } from './motif/LanternMotif'
import { NeonMotif } from './motif/NeonMotif'
import { PrismMotif } from './motif/PrismMotif'
import { ShapesMotif } from './motif/ShapesMotif'
import { StarfieldMotif } from './motif/StarfieldMotif'
import { SunflowerMotif } from './motif/SunflowerMotif'

/**
 * 開催回のモチーフの絵。背景に薄く散らす飾りで、意味は持たない。
 *
 * 絵は SVG で持つ。年ごとの画像を置くとその年だけ重くなるうえ、拡大したときに
 * 粗が出る。背景に薄く敷くだけなら図形で足りる。
 *
 * 1 つ 1 つの絵は `motif/` に分けてある。散らす位置や形の計算は
 * `motif/motifGeometry.ts` が持ち、ここから下は描くだけ。
 */

/**
 * モチーフごとの絵。
 *
 * `Record<EditionMotif, ...>` にしてあるので、`editionThemes.ts` に新しい
 * モチーフを足すと、ここに書き足すまで型が通らない。描き忘れた絵が
 * 「何も出ない年」として静かに紛れ込まないようにするため。
 */
const MOTIF_ART = {
  sunflower: SunflowerMotif,
  starfield: StarfieldMotif,
  shapes: ShapesMotif,
  neon: NeonMotif,
  cloud: CloudMotif,
  lantern: LanternMotif,
  dots: DotsMotif,
  cube: CubeMotif,
  prism: PrismMotif,
} as const satisfies Record<EditionMotif, ComponentType>

export function EditionMotifArt({ motif }: { motif: EditionMotif }) {
  const Art = MOTIF_ART[motif]
  return <Art />
}
