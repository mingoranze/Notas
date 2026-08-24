export interface CardType {
  id: string
  title: string
}

export interface ListType {
  id: string
  title: string
  cards: CardType[]
}

export interface BoardType {
  id: string
  title: string
  lists: ListType[]
}
