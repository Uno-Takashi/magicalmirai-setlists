/**
 * YouTube の埋め込みプレイヤーの再生状態を受け取る。
 *
 * IFrame Player API のスクリプト (www.youtube.com/iframe_api) を読み込む代わりに、
 * API が内部で使っているのと同じ postMessage のやり取りを直接行う。
 * 欲しいのは「終わったか」だけなので、外部スクリプトを 1 本増やす価値はないと判断した。
 *
 * 受け取れなくても再生自体は動く。呼び出し側はこの通知を「来たら使う」程度に扱うこと。
 */

/** IFrame Player API の playerState。数値のまま扱うと読めないので名前を付ける。 */
export type PlayerStatus = 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued'

const PLAYER_STATUS: Readonly<Record<number, PlayerStatus>> = {
  [-1]: 'unstarted',
  0: 'ended',
  1: 'playing',
  2: 'paused',
  3: 'buffering',
  5: 'cued',
}

const YOUTUBE_ORIGINS = ['https://www.youtube.com', 'https://www.youtube-nocookie.com']

function statusOf(data: unknown): PlayerStatus | undefined {
  if (typeof data !== 'string') return undefined
  try {
    const message: unknown = JSON.parse(data)
    if (typeof message !== 'object' || message === null) return undefined
    const info: unknown = (message as { info?: unknown }).info
    if (typeof info !== 'object' || info === null) return undefined
    const state: unknown = (info as { playerState?: unknown }).playerState
    return typeof state === 'number' ? PLAYER_STATUS[state] : undefined
  } catch {
    // プレイヤーは JSON 以外のメッセージも送ってくる。読めないものは黙って捨てる。
    return undefined
  }
}

/**
 * iframe の再生状態を購読する。戻り値を呼ぶと購読をやめる。
 * URL に `enablejsapi=1` が付いていることが前提 (`youtubeEmbedUrl` が付けている)。
 */
export function listenToPlayerStatus(
  iframe: HTMLIFrameElement,
  onChange: (status: PlayerStatus) => void,
): () => void {
  // プレイヤーは「聞いている」と伝えた相手にだけ状態を送ってくる。
  const startListening = () => {
    const message = JSON.stringify({ event: 'listening', id: iframe.id, channel: 'widget' })
    for (const origin of YOUTUBE_ORIGINS) iframe.contentWindow?.postMessage(message, origin)
  }

  const onMessage = (event: MessageEvent) => {
    if (event.source !== iframe.contentWindow) return
    if (!YOUTUBE_ORIGINS.includes(event.origin)) return
    const status = statusOf(event.data)
    if (status !== undefined) onChange(status)
  }

  iframe.addEventListener('load', startListening)
  window.addEventListener('message', onMessage)
  // 既に読み込み済みの iframe に後から購読することもある。
  startListening()

  return () => {
    iframe.removeEventListener('load', startListening)
    window.removeEventListener('message', onMessage)
  }
}
