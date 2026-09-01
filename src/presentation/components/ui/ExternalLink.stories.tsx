import type { Meta, StoryObj } from '@storybook/react-vite'
import { FaGithub } from 'react-icons/fa6'
import { ExternalLink } from './ExternalLink'

const meta = {
  title: 'UI/ExternalLink',
  component: ExternalLink,
  parameters: { layout: 'padded' },
  args: { href: 'https://magicalmirai.com/' },
} satisfies Meta<typeof ExternalLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'マジカルミライ 公式サイト' },
}

/** サービスやリポジトリを示すアイコンを添えた場合。 */
export const WithIcon: Story = {
  args: {
    icon: <FaGithub aria-hidden className="shrink-0" />,
    children: 'Uno-Takashi/magicalmirai-setlists',
  },
}

/** 収まらない長さの文言。切り詰めて、右端の矢印は残す。 */
export const LongLabel: Story = {
  args: { children: 'とても長い出典の名前がここに入って一行に収まらない場合の見え方' },
}
