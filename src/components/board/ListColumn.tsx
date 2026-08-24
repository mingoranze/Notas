import { useEffect, useState } from 'react'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ListType } from '../../types'
import { CardItem } from './CardItem'

interface ListColumnProps {
  list: ListType
  onRemove: () => void
  onRename: (nextTitle: string) => void
  onAddCard: () => void
  onRemoveCard: (cardId: string) => void
  onRenameCard: (cardId: string, nextTitle: string) => void
}

export function ListColumn({ list, onRemove, onRename, onAddCard, onRemoveCard, onRenameCard }: ListColumnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(list.title)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: {
      type: 'column',
      columnId: list.id,
    },
  })

  useEffect(() => {
    setDraftTitle(list.title)
  }, [list.title])

  const commitRename = () => {
    const nextTitle = draftTitle.trim()

    if (!nextTitle) {
      setDraftTitle(list.title)
      setIsEditing(false)
      return
    }

    onRename(nextTitle)
    setIsEditing(false)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex h-full w-[280px] shrink-0 flex-col rounded-2xl border border-line bg-surface/90 shadow-sm backdrop-blur-sm ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      {/* header fixo */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
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
                setDraftTitle(list.title)
                setIsEditing(false)
              }
            }}
            className="w-full border-none bg-transparent font-display text-base font-medium text-ink outline-none"
          />
        ) : (
          <button
            type="button"
            {...attributes}
            {...listeners}
            onClick={() => setIsEditing(true)}
            className="flex-1 overflow-hidden text-left font-display text-base font-medium text-ink"
          >
            <span className="block truncate">{list.title}</span>
          </button>
        )}

        <button
          type="button"
          aria-label={`Excluir coluna ${list.title}`}
          onClick={onRemove}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none text-ink/60 transition hover:bg-mist hover:text-ink"
        >
          ×
        </button>
      </div>

      {/* só essa área rola, quando os cards passarem da altura da coluna */}
      <SortableContext items={list.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-2 pt-3">
          {list.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              columnId={list.id}
              onDelete={() => onRemoveCard(card.id)}
              onRename={(nextTitle) => onRenameCard(card.id, nextTitle)}
            />
          ))}
        </div>
      </SortableContext>

      {/* botão fixo no rodapé */}
      <div className="shrink-0 border-t border-line p-3">
        <button
          type="button"
          onClick={onAddCard}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink/70 transition hover:bg-mist hover:text-navy"
        >
          <span className="text-lg leading-none text-mustard">+</span> adicionar card
        </button>
      </div>
    </div>
  )
}
