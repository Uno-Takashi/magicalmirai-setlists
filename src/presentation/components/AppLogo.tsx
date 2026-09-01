/**
 * サイトのマーク。図形は `public/favicon.svg` にひとつだけ置き、ここはそれを参照する。
 * ブラウザのタブと画面上のマークが必ず同じ図形になり、直す場所も 1 か所で済む。
 *
 * public/ のファイルは JS から import できないので、URL を組み立てて参照する。
 * `BASE_URL` は配信のサブパス (.env の VITE_BASE_PATH) で、末尾は必ず / になる。
 */
export function AppLogo({ className }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}favicon.svg`}
      alt=""
      aria-hidden="true"
      className={className}
    />
  )
}
