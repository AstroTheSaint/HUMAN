'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import { BlurFade } from '@/components/ui/blur-fade'
import { motion, AnimatePresence } from 'framer-motion'
import { LINKS } from '@/lib/constants'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RainbowButton } from '@/components/ui/rainbow-button'
import { useAuth } from '@/contexts/auth-context'

interface MorphingCTA {
  texts: string[]
  link: string
}

interface StoryPlaybackProps {
  hidePlayback?: boolean
  visitorName?: string | null
  isLoggedIn?: boolean
}

interface BaseSectionContent {
  id: string
  title: string
  audioUrl?: string
  imageUrl?: string
  imageCaption?: string
  videoUrl?: string
}

interface RegularSection extends BaseSectionContent {
  type: 'regular'
  content: string
}

interface CTASection extends BaseSectionContent {
  type: 'cta'
  morphingCTA: MorphingCTA
  content?: string
}

type StorySection = RegularSection | CTASection

const STORY_SECTIONS: StorySection[] = [
  {
    id: 'awakening',
    type: 'regular',
    title: 'The Great Awakening',
    content: `Hey there, it's Johnny, and it was an honor to have met you just now.
    
Can you believe it? You're here, alive, a living miracle.

There is so much that's changing in the world right now, and it's a bit unsettling.

But I believe it's the perfect time to reconnect with what makes us human.

***This is an invitation to walk with me on a journey to find your divine purpose, and connect you with others who are already on this amazing path.***`,
    audioUrl: '/story/awakening.mp3'
  },
  {
    id: 'essence',
    type: 'regular',
    title: 'Divine Essence',
    content: `Remember, your worth isn't measured by what you do but by who you are.

AI might get really good at tasks, but it'll never capture the essence of you - your ability to connect, create, and grow spiritually. This isn't just another era; it's your golden age waiting to unfold.

***I want to help you dive back into what makes you uniquely, beautifully human.***`,
    audioUrl: '/story/essence.mp3'
  },
  {
    id: 'community',
    type: 'regular',
    title: 'The HUM人N Movement',
    content: `HUM人N isn't just another community; it's a movement I started with a vision.

I believe technology should enrich our humanity, not overshadow it. Here, you'll learn that true joy comes from connecting with your core, supporting each other through change, and building a future where humanity thrives.`,
    audioUrl: '/story/community.mp3'
  },
  {
    id: 'join-cta',
    type: 'cta',
    title: '',
    content: 'Are you feeling ready to rediscover your essence and help me shape a future that\'s all about being human?',
    morphingCTA: {
      texts: ["Join HUM人N", "Find Purpose", "Build Community", "Shape the Future"],
      link: LINKS.SHOW_INTEREST
    }
  },
  {
    id: 'offerings',
    type: 'regular',
    title: 'What We Offer',
    content: `In our community, you'll find:

- Ways to explore who you truly are and what you're meant to do
- Support for your personal growth journey
- Genuine connections with people who get it
- Events where you can feel that human connection
- Tools to not just survive, but thrive with AI

***I'll walk this path with you as you find your divine purpose.***`,
    audioUrl: '/story/offerings.mp3'
  },
  {
    id: 'future',
    type: 'regular',
    title: 'The Path Forward',
    content: `With AI evolving, our need for real human connections and spiritual growth is more important than ever.

I've created HUM人N to help you:
- Discover your unique purpose
- Build lasting relationships
- Grow and transform together
- Shape a future that honors our humanity

***The future's coming fast. Let me help you embrace it as the most human you can be.***

— Johnny`,
    audioUrl: '/story/future.mp3'
  },
  {
    id: 'final-cta',
    type: 'cta',
    title: '',
    content: 'Ready to join me in creating a community focused on human flourishing in this AI era?',
    morphingCTA: {
      texts: ["Join HUM人N", "Find Purpose", "Build Community", "Shape the Future"],
      link: LINKS.SHOW_INTEREST
    }
  }
]

enum PlaybackState {
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  CONTINUE = 'CONTINUE'
}

const getGreeting = (visitorName: string | null | undefined, loggedInName: string | null | undefined) => {
  const getFirstName = (name: string) => name.split(' ')[0]
  
  if (loggedInName) return `Hey ${getFirstName(loggedInName)}, it's Johnny, and I'm so glad you're here.`
  if (!visitorName) return "Hey there, it's Johnny, and it was an honor to have met you just now."
  return `Hey ${getFirstName(visitorName)}, it's Johnny, and it was an honor to have met you just now.`
}

export function StoryPlayback({ hidePlayback = true, visitorName, isLoggedIn = false }: StoryPlaybackProps) {
  const { user } = useAuth()
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.LOADING)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const [displaySpeed, setDisplaySpeed] = useState(1) // Only for display purposes
  const playbackSpeedRef = useRef(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const shouldAutoplayRef = useRef(false)
  // Scroll handling
  const scrollToSection = useCallback((index: number) => {
    // Use setTimeout to ensure the scroll happens after state updates and DOM changes
    setTimeout(() => {
      const currentCard = cardRefs.current[index]
      if (currentCard) {
        const cardTop = currentCard.offsetTop
        const scrollTarget = cardTop - 50
        window.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        })
      }
    }, 0)
  }, [])

  // Find next regular section
  const findNextRegularSection = useCallback((currentIndex: number, direction: 'forward' | 'backward' = 'forward') => {
    let nextIndex = currentIndex;
    while (
      (direction === 'forward' ? nextIndex < STORY_SECTIONS.length - 1 : nextIndex > 0) &&
      STORY_SECTIONS[direction === 'forward' ? nextIndex + 1 : nextIndex - 1].type === 'cta'
    ) {
      nextIndex = direction === 'forward' ? nextIndex + 1 : nextIndex - 1;
    }
    return direction === 'forward' ? nextIndex + 1 : nextIndex - 1;
  }, []);

  // Handle play/pause
  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !isReady) return

    try {
      if (playbackState === PlaybackState.PLAYING) {
        audio.pause()
        setPlaybackState(PlaybackState.PAUSED)
      } else {
        if (isEnded) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          // Wait for scroll to complete before resetting state
          setTimeout(() => {
            shouldAutoplayRef.current = true
            setCurrentSectionIndex(0)
            setIsEnded(false)
          }, 1000)
          return
        }

        // If it's the first play, scroll to the first card
        if (currentSectionIndex === 0 && playbackState === PlaybackState.PAUSED && !audio.currentTime) {
          scrollToSection(0)
        }

        if (audio.ended) {
          audio.currentTime = 0
        }

        const playPromise = audio.play()
        if (playPromise !== undefined) {
          setPlaybackState(PlaybackState.PLAYING)
          await playPromise
          audio.playbackRate = playbackSpeedRef.current
        } else {
          setPlaybackState(PlaybackState.PLAYING)
        }
      }
    } catch (error) {
      console.error('Playback failed:', error)
      setPlaybackState(PlaybackState.PAUSED)
    }
  }, [playbackState, isReady, isEnded, currentSectionIndex, scrollToSection])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle space when not typing in an input/textarea
      if (event.code === 'Space' &&
        event.target instanceof HTMLElement &&
        !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        event.preventDefault() // Prevent page scroll
        if (isReady && playbackState !== PlaybackState.LOADING) {
          togglePlayPause()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isReady, playbackState, togglePlayPause])

  // Handle section end
  const handleSectionEnd = useCallback(() => {
    const nextRegularSectionIndex = findNextRegularSection(currentSectionIndex);
    if (nextRegularSectionIndex < STORY_SECTIONS.length) {
      shouldAutoplayRef.current = true;
      setCurrentSectionIndex(nextRegularSectionIndex);
    } else {
      setPlaybackState(PlaybackState.PAUSED);
      setIsEnded(true);
    }
  }, [currentSectionIndex, findNextRegularSection]);

  // Initialize audio element
  useEffect(() => {
    setIsReady(false)
    setPlaybackState(PlaybackState.LOADING)
    setProgress(0)
    setIsEnded(false)

    const audio = new Audio()

    const handleCanPlay = async () => {
      setIsReady(true)
      audio.playbackRate = playbackSpeedRef.current
      audio.volume = 1.0 // Set voiceover to full volume

      // If we should autoplay (coming from replay or section end)
      if (shouldAutoplayRef.current) {
        shouldAutoplayRef.current = false
        try {
          const playPromise = audio.play()
          if (playPromise !== undefined) {
            setPlaybackState(PlaybackState.PLAYING)
            await playPromise
          } else {
            setPlaybackState(PlaybackState.PLAYING)
          }
        } catch (error) {
          console.error('Auto-play failed:', error)
          setPlaybackState(PlaybackState.PAUSED)
        }
      } else {
        setPlaybackState(PlaybackState.PAUSED)
      }
    }

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setProgress(audio.currentTime / audio.duration)
      }
    }

    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e)
      setPlaybackState(PlaybackState.PAUSED)
      setIsReady(false)
    }

    // Set up audio element
    audio.src = STORY_SECTIONS[currentSectionIndex].audioUrl || ''
    audio.preload = 'auto'
    audio.currentTime = 0

    // Add event listeners
    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('ended', handleSectionEnd)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('error', handleError)

    // Store reference and set initial playback speed
    audioRef.current = audio
    audio.playbackRate = playbackSpeedRef.current

    // Load the audio
    audio.load()

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('ended', handleSectionEnd)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audio.src = ''
      audioRef.current = null
      setIsReady(false)
    }
  }, [currentSectionIndex, handleSectionEnd])

  // Handle speed change
  const toggleSpeed = useCallback(() => {
    const speeds = [1, 1.5, 2.0, 2.5]
    const currentIndex = speeds.indexOf(playbackSpeedRef.current)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]

    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = nextSpeed
    }
    playbackSpeedRef.current = nextSpeed
    setDisplaySpeed(nextSpeed) // Update display state
  }, [])

  // Handle section change
  const jumpToSection = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only allow jumping to regular sections
    if (STORY_SECTIONS[index].type === 'cta') {
      const nextRegularSection = findNextRegularSection(index, index > currentSectionIndex ? 'forward' : 'backward');
      if (nextRegularSection >= 0 && nextRegularSection < STORY_SECTIONS.length) {
        index = nextRegularSection;
      } else {
        return;
      }
    }

    // If clicking the current section while paused, resume playback
    if (index === currentSectionIndex && playbackState === PlaybackState.PAUSED) {
      togglePlayPause();
      return;
    }

    // Otherwise, handle normal section change
    audio.pause();
    shouldAutoplayRef.current = true;
    setProgress(0);
    setCurrentSectionIndex(index);
    setPlaybackState(PlaybackState.PAUSED);
    scrollToSection(index);
  }, [currentSectionIndex, playbackState, togglePlayPause, scrollToSection, findNextRegularSection]);

  // Watch for section changes (for keyboard navigation or other changes)
  useEffect(() => {
    // Only scroll when component is ready AND it's not the initial load at index 0
    if (isReady && currentSectionIndex > 0) {
      scrollToSection(currentSectionIndex)
    }
  }, [currentSectionIndex, scrollToSection, isReady])

  // Calculate tilt based on mouse position
  const calculateTilt = useCallback((e: React.MouseEvent<HTMLDivElement>, cardElement: HTMLDivElement) => {
    const rect = cardElement.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate percentage position
    const xPercent = (x / rect.width) * 100
    const yPercent = (y / rect.height) * 100

    // Calculate tilt (increased from 2 to 4 degrees)
    const tiltX = ((yPercent - 50) / 50) * -4
    const tiltY = ((xPercent - 50) / 50) * 4

    return { tiltX, tiltY }
  }, [])

  // Create personalized story sections
  const personalizedSections: StorySection[] = STORY_SECTIONS.map(section => {
    if (section.id === 'awakening') {
      return {
        ...section,
        content: `${getGreeting(visitorName, user?.name)}
    
Can you believe it? You're here, alive, a living miracle.

There is so much that's changing in the world right now, and it's a bit unsettling.

But I believe it's the perfect time to reconnect with what makes us human.

***This is an invitation to walk with me on a journey to find your divine purpose, and connect you with others who are already on this amazing path.***`
      }
    }
    return section
  })

  // Filter out CTA sections for logged-in users
  const filteredSections = personalizedSections.filter(section => 
    !isLoggedIn || section.type !== 'cta'
  )

  return (
    <div className="space-y-8">
      <div className="space-y-8 pb-24 max-w-2xl mx-auto">
        {filteredSections.map((section, index) => (
          section.type === 'regular' ? (
            <BlurFade
              key={section.id}
              ref={el => { cardRefs.current[index] = el }}
              className="block"
              delay={0.6 + (index * 0.15)}
              duration={0.8}
              yOffset={20}
              blur="8px"
              inViewMargin="-100px"
            >
              <Card
                className={`relative border-0 shadow-lg transition-all duration-300 transform-gpu will-change-transform
              ${!hidePlayback && index === currentSectionIndex
                    ? 'scale-[1.02] shadow-emerald-500/20 shadow-2xl'
                    : 'opacity-75 hover:opacity-90'}
              ${!hidePlayback ? (index === currentSectionIndex && playbackState === PlaybackState.PLAYING
                    ? '[cursor:url("/pause.svg"),pointer]'
                    : (index !== currentSectionIndex || playbackState !== PlaybackState.PLAYING)
                      ? '[cursor:url("/speaker.svg"),pointer]'
                      : 'cursor-pointer') : ''}`}
                onClick={hidePlayback ? undefined : () => jumpToSection(index)}
                onMouseMove={hidePlayback ? undefined : (e) => {
                  const card = e.currentTarget;
                  const { tiltX, tiltY } = calculateTilt(e, card);
                  card.style.transform = `perspective(2000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${index === currentSectionIndex ? 1.02 : 1})`;
                  card.style.transition = 'transform 0.1s ease-out';
                }}
                onMouseLeave={hidePlayback ? undefined : (e) => {
                  const card = e.currentTarget;
                  card.style.transform = `perspective(2000px) rotateX(0deg) rotateY(0deg) scale(${index === currentSectionIndex ? 1.02 : 1})`;
                  card.style.transition = 'transform 0.5s ease-out';
                }}
              >
                {/* Background layer */}
                <div className={`absolute inset-0 rounded-lg transition-opacity duration-300
              ${index === currentSectionIndex
                    ? '!bg-gray-50 dark:bg-gray-50'
                    : '!bg-white/90 dark:bg-gray-900/90'}`}
                />

                {/* Border effect layer */}
                <div className={`absolute inset-0 rounded-lg transition-all duration-300
              ${index === currentSectionIndex
                    ? 'border-4 border-emerald-500/50 dark:border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : ''}`}
                />

                {/* Content layer */}
                <CardContent className="relative pt-6 z-10 pointer-events-none">
                  <div className="prose prose-lg dark:prose-invert max-w-none select-none pointer-events-auto">
                    <div className={`mb-4 text-center ${index === currentSectionIndex ? '!text-gray-900' : '!text-gray-900 dark:text-gray-100'}`}>
                      <ReactMarkdown
                        components={{
                          a: ({ ...props }) => (
                            <a
                              {...props}
                              className="!text-emerald-700 dark:!text-emerald-500 !no-underline font-bold relative z-20 pointer-events-auto"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          strong: ({ ...props }) => {
                            // Special case for DAY ONE to always be black
                            if (props.children === 'DAY ONE') {
                              return <strong {...props} className="text-gray-900 font-bold" />
                            }
                            return <strong {...props} />
                          },
                          ol: ({ ...props }) => (
                            <ol {...props} className="list-decimal list-inside mx-auto text-center space-y-2 my-4 max-w-[80%]" />
                          ),
                          ul: ({ ...props }) => (
                            <ul {...props} className="list-disc list-inside mx-auto text-center space-y-2 my-4 max-w-[80%]" />
                          ),
                          li: ({ ...props }) => (
                            <li {...props} className="leading-relaxed text-center" />
                          )
                        }}
                      >
                        {section.content}
                      </ReactMarkdown>
                    </div>
                    {section.imageUrl && (
                      <div className="mt-6 mb-8 flex flex-col items-center">
                        <Image
                          src={section.imageUrl}
                          alt={section.title || 'Story section'}
                          width={800}
                          height={600}
                          className="rounded-lg shadow-lg max-h-[400px] min-w-[300px] sm:min-w-[500px] w-auto select-none pointer-events-none"
                        />
                        {section.imageCaption && (
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic text-center select-none">
                            {section.imageCaption}
                          </p>
                        )}
                      </div>
                    )}
                    {section.videoUrl && (
                      <div className="mt-6 mb-6 flex justify-center">
                        <video
                          src={section.videoUrl}
                          controls
                          className="rounded-lg shadow-lg max-h-[400px] w-auto"
                          playsInline
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                  {/* <div className="absolute bottom-2 left-0 right-0 text-center">
                    {section.title && (
                      <GradientText
                        className="text-xs font-bold select-none"
                        colors={["#111111", "#10b981", "#111111"]}
                        animationSpeed={8}
                      >
                        {section.title}
                      </GradientText>
                    )}
                  </div> */}
                </CardContent>
              </Card>
            </BlurFade>
          ) : (
            <BlurFade
              key={section.id}
              delay={0.6 + (index * 0.15)}
              duration={0.8}
              yOffset={20}
              blur="8px"
              inViewMargin="-100px"
            >
              <a
                href={section.morphingCTA.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline w-full max-w-xl mx-auto"
              >
                <RainbowButton className="w-full py-3 rounded-2xl transition-transform duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-bold">JOIN</span>
                    <Image
                      src="/HUMAN_LOGOTYPE_BLK.svg"
                      alt="HUMAN"
                      width={120}
                      height={24}
                      className="h-6 w-auto"
                      priority
                    />
                  </div>
                </RainbowButton>
              </a>
            </BlurFade>
          )
        ))}
      </div>

      {/* Playback controls */}
      {!hidePlayback && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="max-w-screen-xl mx-auto p-4">
            <div className="w-full bg-emerald-100/30 dark:bg-emerald-950/50 h-1 rounded-full mb-4">
              <div className="relative w-full h-full">
                {/* Overall progress bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500/30 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentSectionIndex) / STORY_SECTIONS.length) * 100}%`
                  }}
                />
                {/* Current section progress bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-100"
                  style={{
                    width: `${((currentSectionIndex + progress) / STORY_SECTIONS.length) * 100}%`
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="hidden sm:block w-24 text-sm text-muted-foreground">
                {STORY_SECTIONS.slice(0, currentSectionIndex + 1).filter(s => s.type === 'regular').length} of {STORY_SECTIONS.filter(s => s.type === 'regular').length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => jumpToSection(Math.max(0, currentSectionIndex - 1))}
                  size="sm"
                  variant="outline"
                  className="text-xs @hover:hover:bg-accent @hover:hover:text-accent-foreground active:opacity-100"
                  disabled={currentSectionIndex === 0 || !isReady || playbackState === PlaybackState.LOADING}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={togglePlayPause}
                        disabled={!isReady || playbackState === PlaybackState.LOADING}
                        size="lg"
                        className="w-32 min-w-[128px] bg-emerald-500 @hover:hover:bg-emerald-600 active:bg-emerald-500 text-white group relative active:opacity-100"
                      >
                        {(() => {
                          if (!isReady || playbackState === PlaybackState.LOADING) {
                            return <span className="select-none">Loading...</span>
                          }
                          if (isEnded) {
                            return <span className="select-none">Replay</span>
                          }
                          return (
                            <>
                              <div className="relative h-6">
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={playbackState === PlaybackState.PLAYING ? 'pause' : 'play'}
                                    initial={{ opacity: 0, position: 'absolute', width: '100%', height: '100%' }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex items-center justify-center inset-0 select-none"
                                  >
                                    {playbackState === PlaybackState.PLAYING
                                      ? <><Pause className="mr-2 h-4 w-4" /> Pause</>
                                      : <><Play className="mr-2 h-4 w-4" /> {currentSectionIndex > 0 ? 'Continue' : 'Play'}</>}
                                  </motion.div>
                                </AnimatePresence>
                              </div>
                            </>
                          )
                        })()}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="hidden md:block">
                      Press space to {isEnded ? 'replay' : playbackState === PlaybackState.PLAYING ? 'pause' : currentSectionIndex > 0 ? 'continue' : 'play'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  onClick={() => jumpToSection(Math.min(STORY_SECTIONS.length - 1, currentSectionIndex + 1))}
                  size="sm"
                  variant="outline"
                  className="text-xs @hover:hover:bg-accent @hover:hover:text-accent-foreground active:opacity-100"
                  disabled={currentSectionIndex === STORY_SECTIONS.length - 1 || !isReady ||
                    playbackState === PlaybackState.LOADING ||
                    (currentSectionIndex === 0 && playbackState === PlaybackState.PAUSED && !audioRef.current?.currentTime)}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  onClick={toggleSpeed}
                  size="sm"
                  variant="outline"
                  className="text-xs font-mono min-w-[56px] w-[56px] select-none @hover:hover:bg-accent @hover:hover:text-accent-foreground active:opacity-100"
                  disabled={!isReady || playbackState === PlaybackState.LOADING}
                >
                  {displaySpeed}x
                </Button>
              </div>
              <div className="sm:hidden text-sm text-muted-foreground">
                {STORY_SECTIONS.slice(0, currentSectionIndex + 1).filter(s => s.type === 'regular').length} of {STORY_SECTIONS.filter(s => s.type === 'regular').length}
              </div>
              <div className="hidden sm:block w-24"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 