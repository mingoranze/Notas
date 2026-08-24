import { useEffect, useRef, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { useParams } from 'react-router-dom'
import { AuthControls } from '../components/AuthControls'
import { Board } from '../components/board/Board'
import { mockBoard } from '../data/mockBoard'
import { useAuth } from '../lib/AuthProvider'
import { db } from '../lib/firebase'
import type { BoardType } from '../types'

function getDemoStorageKey(boardId: string) {
  return `demo-board:${boardId}`
}

function loadDemoBoard(boardId: string): BoardType {
  if (typeof window === 'undefined') {
    return { ...mockBoard, id: boardId }
  }

  try {
    const serializedBoard = window.localStorage.getItem(getDemoStorageKey(boardId))

    if (!serializedBoard) {
      return { ...mockBoard, id: boardId }
    }

    return { ...(JSON.parse(serializedBoard) as BoardType), id: boardId }
  } catch {
    return { ...mockBoard, id: boardId }
  }
}

function saveDemoBoard(boardId: string, board: BoardType) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getDemoStorageKey(boardId), JSON.stringify(board))
}

function createColumnId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `list-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createCardId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `card-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function BoardPage() {
  const { status: authStatus } = useAuth()
  const isOwner = authStatus === 'authorized'
  const { boardId } = useParams<{ boardId?: string }>()
  const resolvedBoardId = boardId ?? mockBoard.id
  const [board, setBoard] = useState<BoardType>({ ...mockBoard, id: resolvedBoardId })
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLocallyEditing, setIsLocallyEditing] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Carrega o quadro: Firestore para o dono autenticado, localStorage para modo demonstração
  useEffect(() => {
    if (authStatus === 'loading') {
      return
    }

    setIsInitialized(false)

    if (!isOwner || !db) {
      setBoard(loadDemoBoard(resolvedBoardId))
      setIsInitialized(true)
      return
    }

    const boardRef = doc(db, 'boards', resolvedBoardId)

    const unsubscribe = onSnapshot(boardRef, (snapshot) => {
      if (!snapshot.exists()) {
        const seededBoard = { ...mockBoard, id: resolvedBoardId }
        setBoard(seededBoard)
        void setDoc(boardRef, seededBoard)
        setIsInitialized(true)
        return
      }

      const remoteBoard = { ...(snapshot.data() as BoardType), id: resolvedBoardId }

      // Se o usuário não está editando, atualiza com o valor remoto
      if (!isLocallyEditing) {
        setBoard(remoteBoard)
      }

      setIsInitialized(true)
    })

    return unsubscribe
  }, [authStatus, isOwner, resolvedBoardId, isLocallyEditing])

  // Salva mudanças locais: Firestore (com debounce) para o dono, localStorage para modo demonstração
  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (!isOwner || !db) {
      saveDemoBoard(resolvedBoardId, board)
      return
    }

    const firestore = db

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setIsLocallyEditing(true)

    saveTimeoutRef.current = setTimeout(() => {
      void setDoc(doc(firestore, 'boards', resolvedBoardId), board, { merge: true })
      setIsLocallyEditing(false)
    }, 500)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [board, resolvedBoardId, isOwner, isInitialized])

  const handleAddColumn = () => {
    setBoard((currentBoard) => ({
      ...currentBoard,
      lists: [
        ...currentBoard.lists,
        {
          id: createColumnId(),
          title: `Assunto ${currentBoard.lists.length + 1}`,
          cards: [],
        },
      ],
    }))
  }

  const handleRemoveColumn = (columnId: string) => {
    setBoard((currentBoard) => ({
      ...currentBoard,
      lists: currentBoard.lists.filter((list) => list.id !== columnId),
    }))
  }

  const handleRenameColumn = (columnId: string, nextTitle: string) => {
    const trimmedTitle = nextTitle.trim()

    if (!trimmedTitle) {
      return
    }

    setBoard((currentBoard) => ({
      ...currentBoard,
      lists: currentBoard.lists.map((list) =>
        list.id === columnId ? { ...list, title: trimmedTitle } : list,
      ),
    }))
  }

  const handleAddCard = (columnId: string) => {
    setBoard((currentBoard) => ({
      ...currentBoard,
      lists: currentBoard.lists.map((list) =>
        list.id === columnId
          ? {
              ...list,
              cards: [...list.cards, { id: createCardId(), title: 'Anotação sem título' }],
            }
          : list,
      ),
    }))
  }

  const handleRemoveCard = (columnId: string, cardId: string) => {
    setBoard((currentBoard) => ({
      ...currentBoard,
      lists: currentBoard.lists.map((list) =>
        list.id === columnId
          ? {
              ...list,
              cards: list.cards.filter((card) => card.id !== cardId),
            }
          : list,
      ),
    }))
  }

  const handleRenameCard = (columnId: string, cardId: string, nextTitle: string) => {
    const trimmedTitle = nextTitle.trim()

    if (!trimmedTitle) {
      return
    }

    setBoard((currentBoard) => ({
      ...currentBoard,
      lists: currentBoard.lists.map((list) =>
        list.id === columnId
          ? {
              ...list,
              cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, title: trimmedTitle } : card,
              ),
            }
          : list,
      ),
    }))
  }

  const handleReorderColumns = (activeId: string, overId: string) => {
    setBoard((currentBoard) => {
      const oldIndex = currentBoard.lists.findIndex((list) => list.id === activeId)
      const newIndex = currentBoard.lists.findIndex((list) => list.id === overId)

      if (oldIndex === -1 || newIndex === -1) {
        return currentBoard
      }

      return {
        ...currentBoard,
        lists: arrayMove(currentBoard.lists, oldIndex, newIndex),
      }
    })
  }

  const handleMoveCard = (
    activeCardId: string,
    overCardId: string | null,
    activeColumnId: string,
    overColumnId: string | null,
  ) => {
    if (!overColumnId) {
      return
    }

    setBoard((currentBoard) => {
      const sourceIndex = currentBoard.lists.findIndex((list) => list.id === activeColumnId)
      const targetIndex = currentBoard.lists.findIndex((list) => list.id === overColumnId)

      if (sourceIndex === -1 || targetIndex === -1) {
        return currentBoard
      }

      const nextLists = currentBoard.lists.map((list) => ({
        ...list,
        cards: [...list.cards],
      }))

      const sourceList = nextLists[sourceIndex]
      const targetList = nextLists[targetIndex]
      const sourceCardIndex = sourceList.cards.findIndex((card) => card.id === activeCardId)

      if (sourceCardIndex === -1) {
        return currentBoard
      }

      const [cardToMove] = sourceList.cards.splice(sourceCardIndex, 1)

      if (sourceIndex === targetIndex) {
        const destinationIndex =
          overCardId !== null
            ? nextLists[targetIndex].cards.findIndex((card) => card.id === overCardId)
            : nextLists[targetIndex].cards.length

        const adjustedIndex = destinationIndex === -1 ? nextLists[targetIndex].cards.length : destinationIndex
        nextLists[targetIndex].cards.splice(adjustedIndex, 0, cardToMove)

        return {
          ...currentBoard,
          lists: nextLists,
        }
      }

      const destinationIndex =
        overCardId !== null
          ? targetList.cards.findIndex((card) => card.id === overCardId)
          : targetList.cards.length

      const insertIndex = destinationIndex === -1 ? targetList.cards.length : destinationIndex
      targetList.cards.splice(insertIndex, 0, cardToMove)

      return {
        ...currentBoard,
        lists: nextLists,
      }
    })
  }

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="shrink-0 border-b border-line bg-navy px-4 py-3 text-paper shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-lg font-medium text-paper">{board.title}</h1>
          <AuthControls />
        </div>
        {!isOwner && (
          <p className="mt-1 text-[11px] text-paper/60">
            Modo demonstração — as alterações ficam salvas só neste navegador.
          </p>
        )}
      </header>
      <main className="min-h-0 flex-1">
        <Board
          board={board}
          onAddColumn={handleAddColumn}
          onRemoveColumn={handleRemoveColumn}
          onRenameColumn={handleRenameColumn}
          onAddCard={handleAddCard}
          onRemoveCard={handleRemoveCard}
          onRenameCard={handleRenameCard}
          onReorderColumns={handleReorderColumns}
          onMoveCard={handleMoveCard}
        />
      </main>
    </div>
  )
}
