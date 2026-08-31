/** 1 回の公演(昼/夜それぞれ)。 */

export const SESSIONS = ['matinee', 'evening'] as const
/** 昼公演 / 夜公演。区別が無い(または不明な)公演は undefined。 */
export type Session = (typeof SESSIONS)[number]

export interface Show {
  readonly id: string
  /** 開催日。YYYY-MM-DD。 */
  readonly date: string
  /** Day.1 などの表示ラベル。 */
  readonly label: string
  readonly session?: Session
}

/**
 * 開催日 (YYYY-MM-DD) を Date に変換する。
 * 現地時刻で解釈すると日付が前後にずれるので、UTC の正午で作る。
 */
export function parseEventDate(date: string): Date {
  return new Date(`${date}T12:00:00Z`)
}

export function showDate(show: Show): Date {
  return parseEventDate(show.date)
}
