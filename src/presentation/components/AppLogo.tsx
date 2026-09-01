/**
 * サイトのマーク。6 人のテーマカラーを持つ音符の頭を、旋律の線が結ぶ。
 *
 * 並びは KAITO → 巡音ルカ → 初音ミク → 鏡音レン → 鏡音リン → MEIKO。
 * 鏡音の 2 色は隣り合わせ、ミクは中央に置いて半径だけ大きくしている。
 *
 * 色はロゴの一部なので、dataset のテーマカラーではなくここに直接書く。
 * データが変わってもマークは変わらない。`public/favicon.svg` が同じ図形なので、
 * 片方を直したらもう片方も直すこと。
 */
export function AppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="#BAEBE7" />
      <path
        d="M11 44 L20.4 36 L29.8 40 L39.2 27 L48.6 32 L58 18"
        fill="none"
        stroke="#101828"
        strokeOpacity="0.85"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="44" r="4.4" fill="#3366CC" />
      <circle cx="20.4" cy="36" r="4.4" fill="#FFBACC" />
      <circle cx="29.8" cy="40" r="5" fill="#39C5BB" />
      <circle cx="39.2" cy="27" r="4.4" fill="#FFEE11" />
      <circle cx="48.6" cy="32" r="4.4" fill="#FFCC11" />
      <circle cx="58" cy="18" r="4.4" fill="#DD4444" />
    </svg>
  )
}
