import { createContext, useContext, useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import type { Person } from '@/types'

const ADMIN_IDS = ['pt8AYq40dNTj2oPdWPQoowyOkTw2', 'hJ7weHpB2TTnHaU8XF0hy4416ph1']

interface AuthContextType {
  user: Person | null
  isLoading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, authLoading] = useAuthState(auth)
  const [user, setUser] = useState<Person | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (!authUser) {
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'people', authUser.uid))
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as Person)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchUser()
    }
  }, [authUser, authLoading])

  const value = {
    user,
    isLoading: authLoading || isLoading,
    isAdmin: !!user?.uid && ADMIN_IDS.includes(user.uid)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 