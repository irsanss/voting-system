"use client"

import * as React from "react"
import { Moon, Sun, Leaf, Waves, Heart } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem] animate-pulse" />
        <span className="sr-only">Loading theme</span>
      </Button>
    )
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
      case "sage-green":
        return <Leaf className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
      case "blue-beach":
        return <Waves className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
      case "rose-pink":
        return <Heart className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
      default:
        return <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {getThemeIcon()}
          <span className="sr-only">Switch theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sage-green")}>
          <Leaf className="mr-2 h-4 w-4" />
          <span>Sage Green</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("blue-beach")}>
          <Waves className="mr-2 h-4 w-4" />
          <span>Beach Blue</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("rose-pink")}>
          <Heart className="mr-2 h-4 w-4" />
          <span>Rose Pink</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}