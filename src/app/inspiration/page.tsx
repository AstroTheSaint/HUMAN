'use client'

import { BlurFade } from '@/components/ui/blur-fade'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import Image from 'next/image'
import { SplineScene } from '@/components/spline-scene'
import { BackgroundPaths } from "@/components/ui/background-paths"

interface TweetSection {
  id: string;
  category: string;
  theme: 'ai' | 'crypto' | 'community' | 'future';
  tweetImages: string[]; // paths relative to public/tweets/
}

const TWEET_SECTIONS: TweetSection[] = [
  {
    id: 'infrastructure',
    category: 'The Infrastructure',
    theme: 'crypto',
    tweetImages: [
      'tweet-1887339433621356778.png', // Nader on disruption potential
      'tweet-1887512541741678653.png', // Gary on token launchpad requirements
      'tweet-1883573520682152131.png', // Mary on token buybacks status quo
      'tweet-1876364317043327461.png', // Flaunch features
      'tweet-1885393241278910805.png', // Uniswap v4 hooks
    ]
  },
  {
    id: 'revshare',
    category: 'The Future of Value Distribution',
    theme: 'crypto',
    tweetImages: [
      'tweet-1886779350324031884.png', // Flynn on revshare tokens
      'tweet-1886831433467019286.png', // Guy on pumpfun
      'tweet-1886903279910633856.png', // Yash on attention marketplace
      'tweet-1886989332172464243.png'  // Gary on revtokens
    ]
  }
]

export default function InspirationPage() {
  return (
    <div className="relative min-h-[calc(100vh-100px)] bg-black">
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
          scene="https://prod.spline.design/YoZ7kBmLSx4zIWyG/scene.splinecode"
          className="w-full h-full scale-[3] md:scale-[4]"
        />
      </div>

      {/* Background Paths - Scaled Up */}
      <div className="fixed inset-0 z-[1] opacity-30 scale-[3] origin-center hidden md:block">
        <BackgroundPaths />
      </div>

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
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
            </BlurFade>
          </div>

          <div className="text-center mb-16 mt-12 sm:mt-0">
            <BlurFade className="inline-block" delay={0.2}>
              <div className="flex flex-col">
                <h1 className="text-[15vw] md:text-9xl font-bold mb-4 inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 animate-gradient bg-[length:200%] leading-none py-2">
                  INSPIRATION
                </h1>
              </div>
            </BlurFade>
            <BlurFade delay={0.4}>
              <p className="text-gray-200 mb-4 leading-relaxed text-lg md:text-xl text-shadow-sm bg-black/50 backdrop-blur-sm px-6 py-2 rounded-full inline-block">
                What others are saying about the opportunity ahead
              </p>
            </BlurFade>
          </div>

          {/* Tweet Sections */}
          <div className="space-y-8 pb-24 max-w-xl mx-auto">
            {TWEET_SECTIONS.map((section) => (
              <div key={section.id} className="space-y-4">
                <BlurFade delay={0.6}>
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    {section.category}
                  </h2>
                </BlurFade>

                {section.tweetImages.map((imagePath, index) => (
                  <BlurFade key={imagePath} delay={0.8}>
                    <Card className="relative border-0 shadow-lg transition-all duration-300 transform-gpu hover:scale-[1.02]">
                      <CardContent className="p-6">
                        <Image
                          src={`/tweets/${imagePath}`}
                          alt="Tweet"
                          width={500}
                          height={300}
                          className="w-full rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </BlurFade>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 