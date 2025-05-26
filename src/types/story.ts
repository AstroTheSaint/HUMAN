export enum PlaybackState {
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  CONTINUE = 'CONTINUE'
}

export interface StorySection {
  id: string
  title: string
  content: string
  audioUrl: string
}

export interface StoryPlaybackProps {
  sections: StorySection[]
} 