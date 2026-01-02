import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button"
import { Mail, ArrowRight, Plus, Settings, Trash2 } from "lucide-react"

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "The visual style of the button",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "xl", "icon", "icon-sm", "icon-lg"],
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    asChild: {
      control: "boolean",
      description: "Render as child element using Radix Slot",
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Button",
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
}

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
}

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
}

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail />
        Login with Email
      </>
    ),
  },
}

export const IconRight: Story = {
  args: {
    children: (
      <>
        Get Started
        <ArrowRight />
      </>
    ),
  },
}

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
}

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
}

export const ExtraLarge: Story = {
  args: {
    size: "xl",
    children: "Extra Large",
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
}

export const IconButton: Story = {
  args: {
    size: "icon",
    variant: "outline",
    children: <Plus />,
    "aria-label": "Add item",
  },
}

export const IconButtonSmall: Story = {
  args: {
    size: "icon-sm",
    variant: "outline",
    children: <Settings />,
    "aria-label": "Settings",
  },
}

export const IconButtonLarge: Story = {
  args: {
    size: "icon-lg",
    variant: "destructive",
    children: <Trash2 />,
    "aria-label": "Delete",
  },
}
