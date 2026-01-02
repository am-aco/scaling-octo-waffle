import type { Meta, StoryObj } from "@storybook/react-vite"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"
import { ForgotPasswordForm } from "./ForgotPasswordForm"

const meta: Meta<typeof ForgotPasswordForm> = {
  title: "Auth/ForgotPasswordForm",
  component: ForgotPasswordForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[400px]">
          <Story />
        </div>
        <Toaster />
      </MemoryRouter>
    ),
  ],
  args: {
    onSwitchToSignIn: () => console.log("Switch to Sign In clicked"),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
