'use client'

import { useState, Suspense, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Share, Copy, Check, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { QRCodeSVG } from 'qrcode.react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function InviteForm() {
  const [name, setName] = useState('')
  const [hasCopied, setHasCopied] = useState(false)
  const { toast } = useToast()
  const [user] = useAuthState(auth)

  const getInviteUrl = () => {
    const baseUrl = `${window.location.origin}/story?name=${encodeURIComponent(name)}`
    return user ? `${baseUrl}&referrerId=${user.uid}` : baseUrl
  }

  const handleShare = async () => {
    if (!name.trim()) {
      toast({
        title: "Enter their name first",
        description: "Please enter the person's name to create their personalized invite.",
        variant: "destructive"
      })
      return
    }

    const url = getInviteUrl()
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join HUM人N',
          text: `Hey ${name}, I'd love for you to join me on this journey.`,
          url
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to copying to clipboard
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    if (!name.trim()) {
      toast({
        title: "Enter their name first",
        description: "Please enter the person's name to create their personalized invite.",
        variant: "destructive"
      })
      return
    }

    try {
      const url = getInviteUrl()
      await navigator.clipboard.writeText(url)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
      toast({
        title: "Link copied!",
        description: "Share it with someone special.",
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast({
        title: "Couldn't copy link",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-white/10 backdrop-blur-lg border-white/20">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Create Personal Invitation</h1>
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Their Name
            </label>
            <Input
              id="name"
              placeholder="Enter their name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {name.trim() && (
            <>
              <div className="flex gap-3">
                <Button
                  onClick={handleCopyLink}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  size="lg"
                >
                  {hasCopied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Copy Link
                </Button>

                <Button
                  onClick={handleShare}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  size="lg"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Show QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background/95 backdrop-blur border-white/20">
                  <DialogHeader>
                    <DialogTitle>QR Code for {name}'s Invitation</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="bg-white p-4 rounded-xl">
                      <QRCodeSVG 
                        value={getInviteUrl()}
                        size={256}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground text-center">
                      Scan this code to open the personalized invitation
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense>
      <InviteForm />
    </Suspense>
  )
} 