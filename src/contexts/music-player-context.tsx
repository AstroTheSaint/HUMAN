'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'

interface MusicPlayerContextType {
  isPlaying: boolean
  togglePlay: () => void
  volume: number
  cycleVolume: () => void
  isMuted: boolean
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined)

const MAX_VOLUME = 0.1 // Base max volume
const VOLUME_STATES = [0.25, 0.5, 1] // Quarter, Half, Full (will be multiplied by MAX_VOLUME)

// Helper to detect iOS
const isIOS = () => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volumeIndex, setVolumeIndex] = useState(1) // Start at half volume (index 1)
  const [volume, setVolume] = useState(VOLUME_STATES[1]) // Start at half volume
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isIOSRef = useRef(false)

  useEffect(() => {
    isIOSRef.current = isIOS()
    // Create audio element
    const audio = new Audio('/music/instrumental.mp3')
    audio.loop = true
    audio.volume = volume * MAX_VOLUME // Scale the volume
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    
    if (isIOSRef.current) {
      // On iOS, we use muted state instead of volume
      audioRef.current.muted = isMuted
    } else {
      // On other platforms, we can control volume
      audioRef.current.volume = volume * MAX_VOLUME
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      if (isIOSRef.current) {
        audioRef.current.muted = isMuted
      } else {
        audioRef.current.volume = volume * MAX_VOLUME
      }
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (audioRef.current) {
              if (isIOSRef.current) {
                audioRef.current.muted = isMuted
              } else {
                audioRef.current.volume = volume * MAX_VOLUME
              }
            }
          })
          .catch((error) => {
            console.error('Playback failed:', error)
          })
      }
    }
    setIsPlaying(!isPlaying)
  }

  const cycleVolume = () => {
    if (isIOSRef.current) {
      // On iOS, just toggle mute state
      setIsMuted(!isMuted)
    } else {
      // On other platforms, cycle through volume states
      const nextIndex = (volumeIndex + 1) % VOLUME_STATES.length
      setVolumeIndex(nextIndex)
      setVolume(VOLUME_STATES[nextIndex])
    }
  }

  return (
    <MusicPlayerContext.Provider value={{ isPlaying, togglePlay, volume, cycleVolume, isMuted }}>
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider')
  }
  return context
} 