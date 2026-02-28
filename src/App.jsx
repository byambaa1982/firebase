
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './HomePage'
import Calculator from './Calculator'
import ArduinoControl from './ArduinoControl'
import SearchPage from './SearchPage'
import ContactPage from './ContactPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/arduino" element={<ArduinoControl />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
