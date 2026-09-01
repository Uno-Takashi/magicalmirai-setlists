/**
 * 文字列をファイルとして保存させる。
 *
 * ブラウザとの境界なので presentation には持ち込まない。バックエンドを持たない
 * サイトなので、中身はその場で組み立てて Blob から落とす。
 */

/**
 * @param bom 先頭に UTF-8 の BOM を付けるか。Excel は BOM が無いと日本語を
 *   Shift_JIS と見なして文字化けさせるため、CSV では付ける。
 */
export function downloadText(
  filename: string,
  text: string,
  { type = 'text/plain;charset=utf-8', bom = false }: { type?: string; bom?: boolean } = {},
): void {
  const blob = new Blob([bom ? `﻿${text}` : text], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  // 押した直後に開放すると保存が始まらないことがあるので、次のタスクまで待つ
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
