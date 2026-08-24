import { useAuth } from '../lib/AuthProvider'

export function AuthControls() {
  const { status, user, deniedEmail, signInError, signIn, signOutOwner } = useAuth()

  if (status === 'loading') {
    return null
  }

  if (status === 'authorized' && user) {
    return (
      <div className="flex items-center gap-2 text-xs text-paper/80">
        <span>{user.email}</span>
        <button
          onClick={signOutOwner}
          className="rounded border border-paper/30 px-2 py-1 transition hover:bg-paper/10"
        >
          Sair
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {deniedEmail && <span className="text-red-300">{deniedEmail} sem acesso</span>}
      {signInError && <span className="text-red-300">{signInError}</span>}
      <button
        onClick={signIn}
        className="rounded border border-paper/30 px-2 py-1 transition hover:bg-paper/10"
      >
        Entrar com Google
      </button>
    </div>
  )
}
