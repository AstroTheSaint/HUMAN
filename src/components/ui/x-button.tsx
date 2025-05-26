import { RainbowButton } from '@/components/ui/rainbow-button'

export function XButton() {
  return (
    <div className="flex justify-center">
      <a href="https://www.instagram.com/fonzbentley" target="_blank" rel="noopener noreferrer" className="w-full max-w-xl">
        <RainbowButton className="w-full py-6 text-xl font-bold rounded-2xl transition-transform duration-300 hover:scale-[1.02]">
          DM me
        </RainbowButton>
      </a>
    </div>
  )
}