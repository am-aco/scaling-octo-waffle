import type { Meta, StoryObj } from "@storybook/react-vite"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"
import { SignInForm } from "./SignInForm"
import { AuthProvider } from "../context/AuthContext"

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
    onSwitchToSignUp: () => console.log("Switch to Sign Up clicked"),
    onSwitchToForgotPassword: () => console.log("Switch to Forgot Password clicked"),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
