import { createStars } from './motifGeometry'

const STARS = createStars(420, 20250808)

/** 2025: 白い点の星を夜空に散らす。 */
export function StarfieldMotif() {
  return (
    <>
      {STARS.map(({ left, top, size, animation }, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white"
          style={{ left, top, width: size, height: size, animation }}
        />
      ))}
    </>
  )
}
