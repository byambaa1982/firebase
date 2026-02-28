
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './HomePage'
import Calculator from './Calculator'
import ArduinoControl from './ArduinoControl'
import SearchPage from './SearchPage'
import ControlCenter from './ControlCenter'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ControlCenter />} />
        <Route path="/cookie-clicker" element={<HomePage />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/arduino" element={<ArduinoControl />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
