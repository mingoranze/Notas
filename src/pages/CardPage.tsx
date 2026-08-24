import { useEffect, useRef, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import type { BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import '@excalidraw/excalidraw/index.css'
import { Link, useParams } from 'react-router-dom'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { useAuth } from '../lib/AuthProvider'
import { db } from '../lib/firebase'

type PersistedScene = {
  elements: readonly ExcalidrawElement[]
  files?: BinaryFiles
}

const emptyScene: PersistedScene = { elements: [] }

function getStorageKey(cardId: string) {
  return `excalidraw-scene:${cardId}`
}

function loadDemoScene(cardId: string): PersistedScene {
  if (typeof window === 'undefined') {
    return emptyScene
  }

  try {
    const serializedScene = window.localStorage.getItem(getStorageKey(cardId))

    if (!serializedScene) {
      return emptyScene
    }

    const parsedScene = JSON.parse(serializedScene) as PersistedScene

    return {
      elements: Array.isArray(parsedScene.elements) ? parsedScene.elements : [],
      files: parsedScene.files ?? {},
    }
  } catch {
    return emptyScene
  }
}

function saveDemoScene(cardId: string, scene: PersistedScene) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getStorageKey(cardId), JSON.stringify(scene))
}

export function CardPage() {
  const { cardId } = useParams()
  const activeCardId = cardId ?? 'untitled-card'
  const { status: authStatus } = useAuth()
  const isOwner = authStatus === 'authorized'

  const [scene, setScene] = useState<PersistedScene>(emptyScene)
  const [isInitialized, setIsInitialized] = useState(false)
  const isLocallyEditingRef = useRef(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Carrega o desenho: Firestore para o dono autenticado, localStorage para modo demonstração
  useEffect(() => {
    if (authStatus === 'loading') {
      return
    }

    setIsInitialized(false)

    if (!isOwner || !db) {
      setScene(loadDemoScene(activeCardId))
      setIsInitialized(true)
      return
    }

    const sceneRef = doc(db, 'cards', activeCardId)

    const unsubscribe = onSnapshot(sceneRef, (snapshot) => {
      if (!isLocallyEditingRef.current) {
        setScene(snapshot.exists() ? (snapshot.data() as PersistedScene) : emptyScene)
      }

      setIsInitialized(true)
    })

    return unsubscribe
  }, [authStatus, isOwner, activeCardId])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper text-sm text-ink/60">
        Carregando anotação…
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-line bg-navy px-4 py-3 text-paper shadow-sm">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-paper/60">Cartão</p>
          <h1 className="font-display text-lg font-medium text-paper">Nota {activeCardId}</h1>
        </div>

        <Link to="/" className="text-sm text-paper/80 transition hover:text-paper">
          ← voltar pro quadro
        </Link>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full w-full">
          <Excalidraw
            key={activeCardId}
            initialData={scene}
            onChange={(elements, appState, files) => {
              void appState
              const nextScene: PersistedScene = {
                elements,
                files,
              }

              if (!isOwner || !db) {
                saveDemoScene(activeCardId, nextScene)
                return
              }

              const firestore = db

              if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
              }

              isLocallyEditingRef.current = true

              saveTimeoutRef.current = setTimeout(() => {
                void setDoc(doc(firestore, 'cards', activeCardId), nextScene).finally(() => {
                  isLocallyEditingRef.current = false
                })
              }, 500)
            }}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveAsImage: false,
                saveToActiveFile: false,
                export: false,
              },
            }}
          />
        </div>
      </main>
    </div>
  )
}
