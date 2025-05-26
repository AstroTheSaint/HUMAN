'use client'

import { Card, CardContent } from "@/components/ui/card"
import { BlurFade } from '@/components/ui/blur-fade'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { ExternalLink } from 'lucide-react'
import { GlowEffect } from '@/components/ui/glow-effect'
import { Button } from '@/components/ui/button'

export function IntroCard() {
  return (
    <BlurFade
      className="block"
      delay={0.6}
      duration={0.8}
      yOffset={20}
      blur="8px"
      inViewMargin="-100px"
    >
      <Link href="/story" className="block">
        <Card className="relative border-0 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/20 hover:shadow-2xl group">
          {/* Background layer */}
          <div className="absolute inset-0 rounded-lg !bg-white/90 dark:bg-gray-900/90 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Content layer */}
          <CardContent className="relative pt-6 z-10">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="mb-4 text-center !text-gray-900 dark:text-gray-100">
                <ReactMarkdown>
                  {`I am **Fonzworth Bentley**, also known as **Derek Watkins**. My journey is a vibrant tapestry woven from threads of **music**, **style**, and a relentless pursuit of **purpose**.

From the streets of **Atlanta** through **Morehouse College** to the **Fashion Institute of Technology**, I've cultivated an understanding that true style transcends trends. My path through **biology** and **fashion** has shown that profound understanding often comes from unexpected routes.

As a cultural curator and advocate for refinement, I believe in the power of combining **action** with **intention**, pursuing ambition with **humility**, and moving through life with the grace of our shared humanity.`}
                </ReactMarkdown>
              </div>
              <div className="mt-12 mb-12 flex justify-center">
                <a
                  href="/story"
                  className="pointer-events-auto relative z-30"
                >
                  <GlowEffect
                    colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']}
                    mode="colorShift"
                    blur="soft"
                    duration={3}
                    scale={0.95}
                  />
                  <Button
                    className="relative inline-flex items-center gap-3 rounded-lg bg-zinc-950 px-8 py-6 text-zinc-50 outline outline-1 outline-[#fff2f21f] @hover:hover:bg-zinc-900 transition-all duration-300 @hover:hover:scale-[1.02] text-xl font-medium"
                  >
                    Read my story
                    <ExternalLink className="w-6 h-6" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </BlurFade>
  )
} 