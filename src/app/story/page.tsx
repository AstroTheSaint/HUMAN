'use client'

import { Suspense } from 'react'
import { StoryPlayback } from '@/components/story-playback'
import { BlurFade } from '@/components/ui/blur-fade'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SplineScene } from '@/components/spline-scene'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { LINKS } from '@/lib/constants'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { WhatsAppButton } from '@/components/whatsapp-button'

function StoryContent() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name')
  const [user] = useAuthState(auth)

  return (
    <div className="relative min-h-[calc(100vh - 100px)] bg-black">
      {/* Mobile Background */}
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/mobile.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Desktop Spline Scene */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden md:block md:pointer-events-auto">
        <SplineScene 
          scene="https://prod.spline.design/Wcp-DyKAn5efGlAl/scene.splinecode"
          className="w-full h-full scale-[1.5] md:scale-[1.75]"
        />
      </div>

      {/* Background Paths - Scaled Up */}
      {/* <div className="fixed inset-0 z-[1] opacity-30 scale-[6] origin-center translate-x-[10%] -translate-y-[15%] hidden md:block">
        <BackgroundPaths />
      </div> */}

      {/* Content */}
      <div className="relative z-[2]">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="absolute top-8 left-8">
            <BlurFade delay={0.1}>
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="bg-white/90 hover:bg-white text-zinc-800 hover:text-black border-2 border-zinc-300 hover:border-zinc-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Back</span>
                </Button>
              </Link>
            </BlurFade>
          </div>

          {/* Profile/Join Button */}
          <div className="absolute top-8 right-8">
            <BlurFade delay={0.1}>
              {user ? (
                <Link href="/profile">
                  <Button 
                    variant="outline" 
                    className="bg-white/90 hover:bg-white text-zinc-800 hover:text-black border-2 border-zinc-300 hover:border-zinc-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <span className="text-base">{user.displayName || 'Profile'}</span>
                  </Button>
                </Link>
              ) : (
                <a 
                  href={LINKS.SHOW_INTEREST} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block no-underline"
                >
                  <RainbowButton className="py-2 px-6 rounded-2xl transition-transform duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold">JOIN</span>
                      <Image
                        src="/HUMAN_LOGOTYPE_BLK.svg"
                        alt="HUM人N"
                        width={120}
                        height={24}
                        className="h-6 w-auto hidden md:block"
                        priority
                      />
                    </div>
                  </RainbowButton>
                </a>
              )}
            </BlurFade>
          </div>

          <div className="text-center mb-16 mt-12 sm:mt-0">
            <BlurFade className="inline-block" delay={0.2}>
              <div className="flex flex-col items-center">
                <h1 className="text-[12vw] md:text-8xl font-bold mb-2 inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 animate-gradient bg-[length:200%] leading-none py-2 pr-2">
                  WHY
                </h1>
                <Image
                  src="/HUMAN_LOGOTYPE_WHT.svg"
                  alt="HUMAN"
                  width={500}
                  height={300}
                  className="w-[70vw] md:w-[500px] select-none"
                  priority
                />
              </div>
            </BlurFade>
            <BlurFade delay={0.4}>
              <p className="text-gray-200 mb-4 leading-relaxed text-lg md:text-xl text-shadow-sm bg-black/50 backdrop-blur-sm px-6 py-2 rounded-full inline-block">
                <span className="">As AI reshapes our world, it's time to rediscover what makes us human</span>
              </p>
            </BlurFade>
            <BlurFade delay={0.6}>
              <motion.div 
                className="h-1 w-24 bg-gradient-to-r from-white via-white to-white/70 bg-[length:200%] animate-gradient mx-auto rounded-full opacity-50"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 96, opacity: 0.5 }}
                transition={{
                  duration: 1.2,
                  delay: 1,
                  ease: "easeOut"
                }}
              />
            </BlurFade>
          </div>
          
          <StoryPlayback visitorName={name} isLoggedIn={!!user} />
          
          {/* Add padding to ensure content is visible above fixed controls */}
          <div className="h-40" />
        </div>
      </div>

      <WhatsAppButton />
    </div>
  )
}

export default function StoryPage() {
  return (
    <Suspense>
      <StoryContent />
    </Suspense>
  )
} 