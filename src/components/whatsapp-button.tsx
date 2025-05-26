'use client'

import { BlurFade } from "@/components/ui/blur-fade"
import Image from "next/image"
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'

export function WhatsAppButton() {
  const [user] = useAuthState(auth)

  if (!user) return null

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <BlurFade delay={1.75} className="pointer-events-auto">
        <a 
          href="https://wa.me/14242224539"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 md:px-6 md:py-3 p-3 bg-black/60 text-white/70 text-sm rounded-full border border-white/10 backdrop-blur-sm hover:bg-black/40 hover:text-white hover:border-white/30 transition-all duration-300 group"
        >
          <Image
            src="/WhatsApp.png"
            alt="WhatsApp"
            width={20}
            height={20}
            className="group-hover:opacity-100"
          />
          <span className="hidden md:inline">Text Johnny on WhatsApp</span>
        </a>
      </BlurFade>
    </div>
  )
} 