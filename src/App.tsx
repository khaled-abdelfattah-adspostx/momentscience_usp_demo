import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SelectPerksPage from './pages/SelectPerksPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select-perks" element={<SelectPerksPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
