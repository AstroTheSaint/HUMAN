'use client'

import { useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut, Users, Share } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'
import { BlurFade } from '@/components/ui/blur-fade'
import { SplineScene } from '@/components/spline-scene'
import { useAuth } from '@/contexts/auth-context'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Person } from '@/types'

interface InvitedPerson extends Person {
  id: string;
}

function ProfileContent() {
  const router = useRouter()
  const { user, isLoading, isAdmin } = useAuth()
  const [invitedPeople, setInvitedPeople] = useState<InvitedPerson[]>([])
  const [isLoadingInvites, setIsLoadingInvites] = useState(false)

  // Fetch people this user has invited
  useEffect(() => {
    const fetchInvitedPeople = async () => {
      if (!user?.uid) return

      try {
        setIsLoadingInvites(true)
        const q = query(
          collection(db, 'people'),
          where('referrerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const querySnapshot = await getDocs(q)
        
        const people = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as InvitedPerson[]

        setInvitedPeople(people)
      } catch (error) {
        console.error('Error fetching invited people:', error)
      } finally {
        setIsLoadingInvites(false)
      }
    }

    if (user) {
      fetchInvitedPeople()
    }
  }, [user])

  // Redirect if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white/70">Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="relative min-h-screen bg-black">
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
          scene="https://prod.spline.design/DApbJ-0GkdUsmlkE/scene.splinecode"
          className="w-full h-full scale-[3] md:scale-[4]"
        />
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
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Back</span>
                </Button>
              </Link>
            </BlurFade>
          </div>

          {/* Sign Out Button */}
          <div className="absolute top-8 right-8">
            <BlurFade delay={0.1}>
              <Link href="/signout">
                <Button 
                  variant="outline" 
                  className="bg-white/90 hover:bg-white text-zinc-800 hover:text-black border-2 border-zinc-300 hover:border-zinc-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign Out</span>
                </Button>
              </Link>
            </BlurFade>
          </div>

          <div className="mt-20 space-y-8">
            <BlurFade delay={0.2}>
              <Card className="w-full max-w-2xl mx-auto p-6 bg-black/80 backdrop-blur border-white/20">
                <div className="space-y-6">
                  <div className="text-center">
                    <Image
                      src="/HUMAN_LOGOTYPE_WHT.svg"
                      alt="HUM人N"
                      width={200}
                      height={100}
                      className="w-40 mx-auto mb-6"
                      priority
                    />
                    <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
                    <p className="text-muted-foreground mb-4">
                      Welcome to your personal space in the HUM人N community
                    </p>
                    {isAdmin && (
                      <Link href="/admin">
                        <Button 
                          variant="outline" 
                          className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-2 border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          <span>Admin Dashboard</span>
                        </Button>
                      </Link>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <div className="text-lg">{user.name}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <div className="text-lg">{user.email}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <div className="text-lg">{user.phone}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Account Status</label>
                      <div className="text-lg capitalize">{user.status || 'Pending'}</div>
                    </div>

                    {user.referrerId && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Referred By</label>
                        <div className="text-lg">Johnny Rapp</div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </BlurFade>

            {/* Invited People Section */}
            <BlurFade delay={0.3}>
              <Card className="w-full max-w-2xl mx-auto p-6 bg-black/80 backdrop-blur border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">People You've Invited</h2>
                    <Link href="/invite">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-white/20 hover:bg-white/10"
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Invite More
                      </Button>
                    </Link>
                  </div>

                  {isLoadingInvites ? (
                    <div className="text-center py-4 text-white/70">Loading...</div>
                  ) : invitedPeople.length > 0 ? (
                    <div className="space-y-3">
                      {invitedPeople.map(person => (
                        <div 
                          key={person.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{person.name}</p>
                            <p className="text-sm text-white/50">
                              Joined {person.createdAt?.toDate().toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded-full ${
                              person.status === 'active' 
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-white/10 text-white/50'
                            }`}>
                              {person.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/50">
                      <p>You haven't invited anyone yet.</p>
                      <p className="text-sm mt-2">Share HUM人N with someone special!</p>
                    </div>
                  )}
                </div>
              </Card>
            </BlurFade>

            <BlurFade delay={0.4}>
              <div className="mt-8 text-center">
                <Link href="/invite">
                  <Button 
                    variant="outline" 
                    className="bg-white/90 hover:bg-white text-zinc-800 hover:text-black border-2 border-zinc-300 hover:border-zinc-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    size="lg"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    <span>Invite Someone Special</span>
                  </Button>
                </Link>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>

      <WhatsAppButton />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProfileContent />
  )
} 