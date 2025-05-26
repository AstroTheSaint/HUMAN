'use client'

import { SplineScene } from '@/components/spline-scene'
import { BlurFade } from '@/components/ui/blur-fade'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { GooeyText } from "@/components/ui/gooey-text-morphing"
import { BackgroundPaths } from "@/components/ui/background-paths"
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="w-screen h-[80vh] md:h-screen bg-black overflow-hidden homepage-mobile">
      {/* Profile Link */}
      {user && (
        <div className="absolute top-8 right-8 z-[3]">
          <BlurFade delay={0.1}>
            <Link href="/profile">
              <Button 
                variant="outline" 
                className="bg-white/90 hover:bg-white text-zinc-800 hover:text-black border-2 border-zinc-300 hover:border-zinc-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <span className="text-base">{user.name || 'Profile'}</span>
              </Button>
            </Link>
          </BlurFade>
        </div>
      )}

      {/* Mobile Background */}
      <div className="mobile-bg md:hidden" />

      {/* Desktop Background Paths */}
      <div className="fixed inset-0 z-[1] opacity-30 scale-[1.5] origin-center translate-x-[2%] -translate-y-[3%] hidden md:block">
        <BackgroundPaths />
      </div>

      {/* Desktop Spline Scene */}
      <motion.div 
        className="fixed inset-0 z-0 pointer-events-none hidden md:block md:pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, delay: 0.5, ease: "easeExp" }}
      >
        <SplineScene 
          scene="https://prod.spline.design/Wcp-DyKAn5efGlAl/scene.splinecode"
          className="w-full h-full scale-[2] md:scale-100"
        />
      </motion.div>
      
      {/* Overlay content */}
      <div className="relative z-[2] h-full flex flex-col items-center justify-start pointer-events-none">
        <BlurFade delay={1}>
          <div className="flex flex-col items-center mt-[29vh] md:mt-[40vh] mb-[-2vh]">
            <Image
              src="/HUMAN_LOGOTYPE_WHT.svg"
              alt="HUM人N"
              width={600}
              height={300}
              className="w-[80vw] md:w-[600px] select-none"
              priority
            />
          </div>
        </BlurFade>

        <BlurFade delay={1.25}>
          <div className="h-[100px] flex items-center justify-center">
            <GooeyText
              texts={["Movement", "Awakening", "Community", "Purpose", "Evolution"]}
              morphTime={1}
              cooldownTime={0.25}
              className="text-white font-bold text-2xl md:text-4xl"
            />
          </div>
        </BlurFade>

        <BlurFade delay={1.5} className="mt-8 pointer-events-auto">
          <Link href="/story">
            <motion.button
              className="px-8 py-3 bg-black/80 text-white text-lg md:text-xl font-bold rounded-full border-2 border-white/20 backdrop-blur-sm hover:bg-black/60 hover:scale-105 hover:border-white/40 transition-all duration-300"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {user ? "Read Why This Matters" : "Join the Movement"}
            </motion.button>
          </Link>
        </BlurFade>
      </div>
    </div>
  )
}
