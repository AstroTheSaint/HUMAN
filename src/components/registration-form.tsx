'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { useSearchParams } from 'next/navigation'
import { db, auth, googleProvider } from '@/lib/firebase'
import { signInWithPopup, UserCredential } from 'firebase/auth'
import { collection, addDoc, serverTimestamp, getDocs, query, doc, setDoc } from 'firebase/firestore'
import type { Person, PersonCreate } from '@/types'
import { useAuth } from '@/contexts/auth-context'

// Clean phone number by removing all non-digit characters except + at start
const cleanPhoneNumber = (phone: string) => {
  // First, remove any invisible Unicode characters
  const cleaned = phone.replace(/[\u200B-\u200D\uFEFF]/g, '')
  // Then keep only digits and + (if at start)
  return cleaned.replace(/[^\d+]/g, '')
}

interface RegistrationFormProps {
  onClose: () => void
}

export function RegistrationForm({ onClose }: RegistrationFormProps) {
  const searchParams = useSearchParams()
  const nameFromUrl = searchParams.get('name')
  const referrerIdFromUrl = searchParams.get('referrerId')
  const { user, isLoading } = useAuth()
  
  const [formData, setFormData] = useState<Person>({
    name: nameFromUrl || '',
    email: '',
    phone: '',
    referrerId: '',
    referrerNote: ''
  })
  const [existingPeople, setExistingPeople] = useState<Array<{id: string, name: string}>>([])
  const [step, setStep] = useState<'auth' | 'details'>('auth')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Don't show anything while auth is loading or if user is already logged in
  if (isLoading || user) return null

  // Fetch active people from Firestore
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const q = query(collection(db, 'people'))
        const querySnapshot = await getDocs(q)
        const people = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }))
        setExistingPeople(people)

        // Find Johnny Rapp's ID by name
        const johnnyRapp = people.find(p => p.name === 'Johnny Rapp')
        
        // Set referrer ID to either the URL param or Johnny's ID if found
        setFormData(prev => ({
          ...prev,
          referrerId: referrerIdFromUrl || (johnnyRapp?.id || '')
        }))
      } catch (error) {
        console.error('Error fetching people:', error)
        setExistingPeople([])
      }
    }

    if (step === 'details') {
      fetchPeople()
    }
  }, [step, referrerIdFromUrl])

  // Update name when URL param changes or after Google sign in
  useEffect(() => {
    if (nameFromUrl) {
      setFormData(prev => ({ ...prev, name: nameFromUrl }))
    }
  }, [nameFromUrl])

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true)
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Pre-fill the form with Google data
      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
      }))

      setStep('details')
      
      toast({
        title: "Successfully connected with Google",
        description: "Now, let's get to know you a bit better.",
      })
    } catch (error) {
      console.error('Google sign in error:', error)
      toast({
        title: "Couldn't connect with Google",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!auth.currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in with Google first.",
        variant: "destructive",
      })
      return
    }

    // Basic validation
    if (!formData.name || !formData.phone) {
      toast({
        title: "I need a bit more info",
        description: "Could you fill in all the fields? I want to make sure we can stay connected.",
        variant: "destructive",
      })
      return
    }

    // Phone validation (basic)
    const cleanedPhone = cleanPhoneNumber(formData.phone)
    if (cleanedPhone.length < 10) {
      toast({
        title: "About your phone number",
        description: "Could you make sure your phone number is complete? I'd love to be able to reach you.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      // Prepare data for Firestore with cleaned phone and auth data
      const personData: PersonCreate = {
        ...formData,
        phone: cleanedPhone,
        createdAt: serverTimestamp(),
        status: 'pending',
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || formData.email,
      }

      // Add to Firestore
      const docRef = await setDoc(doc(db, 'people', auth.currentUser.uid), personData)

      // Send welcome email
      try {
        const emailResponse = await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: auth.currentUser.email || formData.email,
          }),
        })

        if (!emailResponse.ok) {
          console.error('Failed to send welcome email:', await emailResponse.text())
        }
      } catch (error) {
        console.error('Error sending welcome email:', error)
      }
      
      onClose()

      // Show success toast with more detailed message
      toast({
        title: `Welcome to HUM人N, ${formData.name}!`,
        description: "I've received your registration. I'll personally review and activate your account soon. You'll get a message from me when it's ready!",
        duration: 6000,
      })

      // Show a follow-up toast about next steps
      setTimeout(() => {
        toast({
          title: "What's Next?",
          description: "Feel free to explore while I prepare your account. I'll make sure you don't miss anything important.",
          duration: 5000,
        })
      }, 1000)
    } catch (error) {
      console.error('Error saving registration:', error)
      toast({
        title: "Oops, something went wrong",
        description: "I couldn't save your information. Could you try again?",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-background/95 backdrop-blur border-white/20">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/HUMAN_LOGOTYPE_WHT.svg"
              alt="HUMAN"
              width={200}
              height={100}
              className="w-40"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {step === 'auth' ? "Welcome to HUM人N" : (nameFromUrl ? `Hey ${nameFromUrl}!` : "Hey there!")}
          </h2>
          <p className="text-muted-foreground">
            {step === 'auth' 
              ? `It's been a pleasure to connect with you, ${nameFromUrl}! Your journey begins by connecting your Google account. This helps personalize your journey every step of the way.`
              : (nameFromUrl 
                ? "I'm thrilled you're here. I'd love to know a bit more about you so we can stay connected on this journey together."
                : "I'm thrilled you're here. Before we begin this amazing journey together, I'd love to know a bit about you so we can stay connected.")}
          </p>
        </div>

        {step === 'auth' ? (
          <div className="space-y-4">
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-100 text-gray-900"
              size="lg"
              disabled={isSubmitting}
            >
              <Image
                src="/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with Google
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to join a movement focused on human flourishing in the age of AI.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {existingPeople.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="referrer" className="block text-sm font-medium mb-2">
                  Who brought you here?
                </label>
                <select
                  id="referrer"
                  value={formData.referrerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, referrerId: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select someone</option>
                  {existingPeople.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>

                {formData.referrerId && (
                  <div className="mt-4">
                    <label htmlFor="referrerNote" className="block text-sm font-medium mb-2">
                      Want to leave them a note? (optional)
                    </label>
                    <textarea
                      id="referrerNote"
                      placeholder="Write a quick note to the person who brought you here..."
                      value={formData.referrerNote || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, referrerNote: e.target.value }))}
                      className="w-full min-h-[80px] rounded-md border border-input bg-background/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  {nameFromUrl ? "Is this your name?" : "What's your name?"}
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Your phone number for updates
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 555-5555"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                size="lg"
                disabled={isSubmitting}
              >
                Let's Begin Our Journey
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By joining, you'll be part of a movement focused on human flourishing in the age of AI.
              </p>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
} 