import { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import trashIcon from '../../images/lixeira.png'
import type { CardType } from '../../types'

interface CardItemProps {
  card: CardType
  columnId: string
  onDelete: () => void
  onRename: (nextTitle: string) => void
}

export function CardItem({ card, columnId, onDelete, onRename }: CardItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(card.title)

  useEffect(() => {
    setDraftTitle(card.title)
  }, [card.title])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      cardId: card.id,
      columnId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const commitRename = () => {
    const nextTitle = draftTitle.trim()

    if (!nextTitle) {
      setDraftTitle(card.title)
      setIsEditing(false)
      return
    }

    onRename(nextTitle)
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border border-line bg-surface p-2 shadow-[0_2px_10px_rgba(31,45,61,0.08)] transition hover:-translate-y-0.5 hover:border-mustard/60 hover:shadow-[0_8px_20px_rgba(31,45,61,0.12)] ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      <div className="block">
        <Link
          to={`/card/${card.id}`}
          {...attributes}
          {...listeners}
          className="block"
        >
          {/* preview do desenho — vira a miniatura da cena do Excalidraw no passo 8 */}
          <div className="aspect-[4/3] w-full rounded-lg border border-dashed border-stone bg-mist transition group-hover:border-mustard/70" />
        </Link>

        {isEditing ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commitRename()
              }

              if (event.key === 'Escape') {
                setDraftTitle(card.title)
                setIsEditing(false)
              }
            }}
            className="mt-2 w-full border-none bg-transparent text-sm font-medium text-ink outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-2 block w-full truncate text-left text-sm font-medium text-ink/80"
          >
            {card.title}
          </button>
        )}
      </div>

      <button
        type="button"
        aria-label={`Excluir cartão ${card.title}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onDelete()
        }}
        className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-md border border-line bg-surface/90 p-1 shadow-sm transition hover:border-mustard hover:bg-mist"
      >
        <img src={trashIcon} alt="Excluir cartão" className="h-3.5 w-3.5 object-contain" />
      </button>
    </div>
  )
}
