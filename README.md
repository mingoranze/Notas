# Kanban Notes

Quadro estilo Trello onde cada card é uma nota com desenho (estilo Excalidraw).

## Rodando o projeto

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Publicação no GitHub Pages

O deploy é feito automaticamente pelo GitHub Actions após um push na branch
`main`. Depois da execução do workflow, o sistema fica disponível em:

`https://mingoranze.github.io/Notas/`

## O que já está pronto (passo 1 do roteiro)

- Projeto Vite + React + TypeScript + Tailwind
- Rotas já configuradas: `/board/:boardId` e `/card/:cardId` (placeholder)
- Componente de coluna com header e botão "+ adicionar card" fixos, e área de
  cards com scroll próprio (igual ao wireframe)
- Botão "+ adicionar coluna" no fim da fileira
- Board de exemplo (`src/data/mockBoard.ts`) com as colunas Assunto 1/2/3
- Clicar num card já navega pra `/card/:id` (a página do editor ainda é um
  placeholder)

Os botões de adicionar coluna/card ainda não fazem nada — os `onClick` estão
marcados com `// TODO passo 2` nos componentes.

## Roteiro completo

1. ~~Estrutura da coluna~~ ✅ você está aqui
2. ~~Botão de adicionar coluna funcionar (estado local)~~ ✅
3. ~~Componente de cartão~~ ✅
4. ~~Criação de cartões funcionar (estado local)~~ ✅
5. ~~Drag-and-drop (reordenar e mover entre colunas)~~ ✅
6. ~~Iniciar o backend (Firebase / Firestore)~~ ✅
7. ~~Introduzir a API do Excalidraw (`@excalidraw/excalidraw`) na página do card~~ ✅
8. Salvar os cartões no Firestore (cena do Excalidraw incluída)

## Estrutura de pastas

```
src/
  components/board/   Board, ListColumn, CardItem, AddColumnButton
  pages/               BoardPage (/board/:id), CardPage (/card/:id)
  data/                mockBoard.ts — dados de exemplo, sai quando o Firebase entrar
  types.ts             Board, List, Card
```
