import type { BoardType } from '../types'

export const mockBoard: BoardType = {
  id: 'board-1',
  title: 'Meu quadro',
  lists: [
    {
      id: 'list-1',
      title: 'Assunto 1',
      cards: [
        { id: 'card-1', title: 'Anotação sem título' },
        { id: 'card-2', title: 'Anotação sem título' },
      ],
    },
    {
      id: 'list-2',
      title: 'Assunto 2',
      cards: [
        { id: 'card-3', title: 'Anotação sem título' },
        { id: 'card-4', title: 'Anotação sem título' },
      ],
    },
    {
      id: 'list-3',
      title: 'Assunto 3',
      cards: [{ id: 'card-5', title: 'Anotação sem título' }],
    },
  ],
}
