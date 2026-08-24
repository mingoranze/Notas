import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { FirebaseError } from 'firebase/app'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth } from './firebase'

const OWNER_EMAIL = 'keven.hmo@gmail.com'
const IGNORED_SIGN_IN_ERROR_CODES = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']

type AuthStatus = 'loading' | 'signed-out' | 'authorized'

type AuthContextValue = {
  status: AuthStatus
  user: User | null
  deniedEmail: string | null
  signInError: string | null
  signIn: () => void
  signOutOwner: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null)
  const [signInError, setSignInError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setStatus('signed-out')
      return
    }

    const currentAuth = auth

    return onAuthStateChanged(currentAuth, (nextUser) => {
      if (!nextUser) {
        setUser(null)
        setStatus('signed-out')
        return
      }

      if (nextUser.email !== OWNER_EMAIL) {
        setDeniedEmail(nextUser.email)
        void signOut(currentAuth)
        return
      }

      setDeniedEmail(null)
      setUser(nextUser)
      setStatus('authorized')
    })
  }, [])

  const signIn = () => {
    if (!auth) return
    const currentAuth = auth
    setSignInError(null)

    signInWithPopup(currentAuth, new GoogleAuthProvider()).catch((error: unknown) => {
      if (error instanceof FirebaseError && IGNORED_SIGN_IN_ERROR_CODES.includes(error.code)) {
        return
      }

      setSignInError('Não foi possível entrar com o Google. Tente novamente.')
    })
  }

  const signOutOwner = () => {
    if (!auth) return
    void signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ status, user, deniedEmail, signInError, signIn, signOutOwner }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return context
}
