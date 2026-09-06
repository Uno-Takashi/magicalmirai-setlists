import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppFooter } from './AppFooter'

/** 画面の脚注。非公式のファンページであることを断る一文だけを置く。 */
const meta = {
  title: 'App/AppFooter',
  component: AppFooter,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
