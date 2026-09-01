/**
 * 択一の切り替え。選択肢が 2〜3 個で、その場に全部見せたいときに使う。
 *
 * 押した札だけ色を変え、状態は `aria-pressed` でも伝える。
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  renderLabel,
}: {
  /** 読み上げ用のまとまりの名前。 */
  label: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  renderLabel: (option: T) => string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="surface-card flex shrink-0 gap-0.5 rounded-lg p-0.5"
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === value}
          onClick={() => onChange(option)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
            option === value ? 'bg-miku/15 text-miku' : 'text-muted hover:bg-black/[0.04]'
          }`}
        >
          {renderLabel(option)}
        </button>
      ))}
    </div>
  )
}
