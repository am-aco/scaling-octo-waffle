import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "./input"
import { Label } from "./label"

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
}

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "name@example.com",
  },
}

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "••••••••",
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  ),
}

export const WithValue: Story = {
  args: {
    defaultValue: "john@example.com",
    type: "email",
  },
}
