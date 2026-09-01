import type { Meta, StoryObj } from '@storybook/react-vite'
import { ExternalLink } from './ExternalLink'
import { Modal, ModalHeader, ModalSection } from './Modal'

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
  args: { open: true, onClose: () => {}, label: 'モーダルの見本' },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

/** サイト全体の話をするモーダル。見出しはミクの色で置く。 */
export const Accent: Story = {
  args: {
    children: (
      <>
        <ModalHeader
          title="このサイトについて"
          tone="accent"
          onClose={() => {}}
          closeLabel="閉じる"
        />
        <p className="mt-2 text-sm leading-relaxed">節を並べて説明を載せる。</p>
        <ModalSection title="出典">
          <ExternalLink href="https://magicalmirai.com/">マジカルミライ 公式サイト</ExternalLink>
        </ModalSection>
      </>
    ),
  },
}

/** 個々のものの詳細。名前をそのまま太字の見出しにして、補足を下に続ける。 */
export const Plain: Story = {
  args: {
    children: (
      <>
        <ModalHeader className="mb-4" title="ロキ" onClose={() => {}} closeLabel="閉じる">
          <p className="text-muted mt-0.5 text-sm">みきとP</p>
        </ModalHeader>
        <div className="surface-card grid h-40 place-items-center rounded-xl text-sm">中身</div>
      </>
    ),
  },
}

/** 設定のように項目が少ないものは細くする。 */
export const Narrow: Story = {
  args: {
    width: 'sm',
    children: <ModalHeader title="設定" tone="accent" onClose={() => {}} closeLabel="閉じる" />,
  },
}

export const Closed: Story = {
  args: { open: false, children: null },
}
