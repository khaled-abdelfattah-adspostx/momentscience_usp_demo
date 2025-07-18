import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SelectPerksPage from './pages/SelectPerksPage'
import ThankYouPage from './pages/ThankYouPage'
import './App.css'

function App() {
  return (
    <Router basename="/momentscience_usp_demo">
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select-perks" element={<SelectPerksPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
