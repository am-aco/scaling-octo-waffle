import type { Meta, StoryObj } from "@storybook/react-vite"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"
import { SignUpForm } from "./SignUpForm"
import { AuthProvider } from "../context/AuthContext"

const meta: Meta<typeof SignUpForm> = {
  title: "Auth/SignUpForm",
  component: SignUpForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthProvider>
          <div className="w-[400px]">
            <Story />
          </div>
          <Toaster />
        </AuthProvider>
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
