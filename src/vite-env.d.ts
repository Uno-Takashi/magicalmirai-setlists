/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** サイトの公開 URL。末尾のスラッシュを含む。 */
  readonly VITE_SITE_URL: string
  /** 配信のサブパス。Vite の base と同じ値。 */
  readonly VITE_BASE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
