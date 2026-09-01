/** 数と単位。単位はランキングの行と同じく、数より小さく控えめに置く。 */
export function StatTile({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="surface-card rounded-xl p-3">
      <p className="text-2xl leading-none font-black tabular-nums">
        {value}
        <span className="text-muted ml-0.5 text-xs">{unit}</span>
      </p>
      <p className="text-muted mt-1 text-xs">{label}</p>
    </div>
  )
}
