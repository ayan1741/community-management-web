import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Membership, UserProfile } from '@/types'
import { api } from '@/lib/api'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  memberships: Membership[]
  activeMembership: Membership | null
  setActiveMembership: (m: Membership) => void
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [activeMembership, setActiveMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) loadUserData()
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) {
        setLoading(true)
        loadUserData()
      } else {
        setProfile(null)
        setMemberships([])
        setActiveMembership(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserData() {
    try {
      const { data } = await api.get<{ profile: UserProfile; memberships: Membership[] }>('/me')
      setProfile(data.profile)
      setMemberships(data.memberships)
      if (data.memberships.length === 1) {
        setActiveMembership(data.memberships[0])
      }
    } catch {
      // profil yüklenemedi — oturum geçersiz olabilir
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{
      session, user, profile, memberships,
      activeMembership, setActiveMembership,
      loading, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
