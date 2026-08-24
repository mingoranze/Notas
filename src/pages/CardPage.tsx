import { useMemo } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import type { BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import '@excalidraw/excalidraw/index.css'
import { Link, useParams } from 'react-router-dom'

type PersistedScene = {
  elements: readonly ExcalidrawElement[]
  files?: BinaryFiles
}

function getStorageKey(cardId: string) {
  return `excalidraw-scene:${cardId}`
}

function loadScene(cardId: string): PersistedScene {
  if (typeof window === 'undefined') {
    return { elements: [] }
  }

  try {
    const serializedScene = window.localStorage.getItem(getStorageKey(cardId))

    if (!serializedScene) {
      return { elements: [] }
    }

    const parsedScene = JSON.parse(serializedScene) as PersistedScene

    return {
      elements: Array.isArray(parsedScene.elements) ? parsedScene.elements : [],
      files: parsedScene.files ?? {},
    }
  } catch {
    return { elements: [] }
  }
}

export function CardPage() {
  const { cardId } = useParams()
  const activeCardId = cardId ?? 'untitled-card'
  const scene = useMemo(() => loadScene(activeCardId), [activeCardId])

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
              const nextScene: PersistedScene = {
                elements,
                files,
              }

              window.localStorage.setItem(getStorageKey(activeCardId), JSON.stringify(nextScene))
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
