'use client'

import { useState, useEffect, Suspense } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from 'next/navigation'
import { RegistrationForm } from '@/components/registration-form'
import { AuthProvider, useAuth } from '@/contexts/auth-context'

function RegistrationModal() {
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Skip registration on /invite page
    if (pathname === '/invite') return

    if (!isLoading) {
      setShowModal(!user)
    }
  }, [pathname, user, isLoading])

  if (isLoading || !showModal) return null

  return <RegistrationForm onClose={() => setShowModal(false)} />
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
      <Suspense>
        <RegistrationModal />
      </Suspense>
    </AuthProvider>
  )
} 