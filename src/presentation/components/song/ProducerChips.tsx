import { FaUserPen } from 'react-icons/fa6'
import { MUTED_CHIP } from '@/presentation/components/ui/chipStyles'

/**
 * 作曲者のチップ。合作は 1 つにまとめず、作曲者ごとに分けて並べる。
 *
 * 曲名の下に置く控えめな札なので、歌唱者のチップ (テーマカラー付き) より
 * 目立たない配色にしてある。
 */
export function ProducerChips({ producers }: { producers: readonly string[] }) {
  return producers.map((producer) => (
    <span
      key={producer}
      className={`${MUTED_CHIP} inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-medium break-all`}
    >
      <FaUserPen className="shrink-0 text-[8px] opacity-70" aria-hidden />
      {producer}
    </span>
  ))
}
