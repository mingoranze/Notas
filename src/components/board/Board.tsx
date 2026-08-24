import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import type { BoardType } from '../../types'
import { ListColumn } from './ListColumn'
import { AddColumnButton } from './AddColumnButton'

interface BoardProps {
  board: BoardType
  onAddColumn: () => void
  onRemoveColumn: (columnId: string) => void
  onRenameColumn: (columnId: string, nextTitle: string) => void
  onAddCard: (columnId: string) => void
  onRemoveCard: (columnId: string, cardId: string) => void
  onRenameCard: (columnId: string, cardId: string, nextTitle: string) => void
  onReorderColumns: (activeId: string, overId: string) => void
  onMoveCard: (
    activeCardId: string,
    overCardId: string | null,
    activeColumnId: string,
    overColumnId: string | null,
  ) => void
}

export function Board({
  board,
  onAddColumn,
  onRemoveColumn,
  onRenameColumn,
  onAddCard,
  onRemoveCard,
  onRenameCard,
  onReorderColumns,
  onMoveCard,
}: BoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )

  const handleDragEnd = ({ active, over }: { active: { id: string | number; data?: { current?: { type?: string; columnId?: string } } }; over: { id: string | number; data?: { current?: { type?: string; columnId?: string } } } | null }) => {
    if (!over || active.id === over.id) {
      return
    }

    const activeData = active.data?.current
    const overData = over.data?.current

    if (activeData?.type === 'column') {
      onReorderColumns(String(active.id), String(over.id))
      return
    }

    if (activeData?.type === 'card') {
      const activeColumnId = activeData.columnId
      const overColumnId = overData?.columnId ?? (overData?.type === 'column' ? String(over.id) : null)

      onMoveCard(String(active.id), String(over.id), activeColumnId ?? '', overColumnId)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={board.lists.map((list) => list.id)} strategy={horizontalListSortingStrategy}>
        <div className="board-scroll flex h-full gap-4 overflow-x-auto px-4 py-4">
          {board.lists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              onRemove={() => onRemoveColumn(list.id)}
              onRename={(nextTitle) => onRenameColumn(list.id, nextTitle)}
              onAddCard={() => onAddCard(list.id)}
              onRemoveCard={(cardId) => onRemoveCard(list.id, cardId)}
              onRenameCard={(cardId, nextTitle) => onRenameCard(list.id, cardId, nextTitle)}
            />
          ))}
          <AddColumnButton onClick={onAddColumn} />
        </div>
      </SortableContext>
    </DndContext>
  )
}
