'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    const signOut = async () => {
      try {
        await auth.signOut()
      } catch (error) {
        console.error('Error signing out:', error)
      } finally {
        // Redirect to homepage regardless of success/failure
        router.push('/')
      }
    }

    signOut()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white/70">
      Signing you out...
    </div>
  )
} 