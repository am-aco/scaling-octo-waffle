import type { Meta, StoryObj } from "@storybook/react-vite"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"
import { SignInForm } from "./SignInForm"

const meta: Meta<typeof SignInForm> = {
  title: "Auth/SignInForm",
  component: SignInForm,
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
    onSwitchToSignUp: () => console.log("Switch to Sign Up clicked"),
    onSwitchToForgotPassword: () => console.log("Switch to Forgot Password clicked"),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
