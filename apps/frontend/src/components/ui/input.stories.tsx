import type { Meta, StoryObj } from "@storybook/react-vite"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search", "file"],
      description: "The input type",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
  },
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

export const Invalid: Story = {
  args: {
    type: "email",
    defaultValue: "invalid-email",
    "aria-invalid": true,
    placeholder: "name@example.com",
  },
}

export const InvalidWithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email-error">Email</Label>
      <Input
        id="email-error"
        type="email"
        defaultValue="invalid-email"
        aria-invalid={true}
        className="border-destructive"
      />
      <p className="text-sm text-destructive">Please enter a valid email address</p>
    </div>
  ),
}

export const FileInput: Story = {
  args: {
    type: "file",
  },
}

export const Search: Story = {
  args: {
    type: "search",
    placeholder: "Search...",
  },
}

export const Number: Story = {
  args: {
    type: "number",
    placeholder: "0",
    min: 0,
    max: 100,
  },
}
