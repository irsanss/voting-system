"use client"

import { useState } from "react"
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface ShareButtonProps {
  title?: string
  description?: string
  url?: string
}

export function ShareButton({ 
  title = "Apartment Voting System", 
  description = "Secure, transparent, and efficient voting for apartment communities",
  url = typeof window !== 'undefined' ? window.location.href : ""
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState(url)

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + "\n\n" + shareUrl)}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error)
      }
    }
  }

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Voting System</DialogTitle>
          <DialogDescription>
            Share this secure voting platform with your apartment community
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="h-9"
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
          <Button 
            size="sm" 
            className="px-3"
            onClick={copyToClipboard}
          >
            <span className="sr-only">Copy</span>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex flex-col space-y-3">
          <div className="text-sm font-medium">Share via</div>
          <div className="grid grid-cols-2 gap-2">
            <DropdownMenuItem asChild>
              <button
                onClick={() => openShareWindow(shareUrls.facebook)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors w-full"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                <span>Facebook</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button
                onClick={() => openShareWindow(shareUrls.twitter)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors w-full"
              >
                <Twitter className="h-4 w-4 text-sky-500" />
                <span>Twitter</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button
                onClick={() => openShareWindow(shareUrls.linkedin)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors w-full"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
                <span>LinkedIn</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button
                onClick={() => openShareWindow(shareUrls.email)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors w-full"
              >
                <Mail className="h-4 w-4 text-gray-600" />
                <span>Email</span>
              </button>
            </DropdownMenuItem>
          </div>
          {navigator.share && (
            <Button
              onClick={shareNative}
              variant="outline"
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via native sharing
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}