import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthProvider'
import { BoardPage } from './pages/BoardPage'
import { CardPage } from './pages/CardPage'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<BoardPage />} />
          <Route path="/board/:boardId" element={<BoardPage />} />
          <Route path="/card/:cardId" element={<CardPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
