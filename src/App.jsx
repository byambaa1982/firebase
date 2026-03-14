
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import HomePage from './HomePage'
import Calculator from './Calculator'
import ArduinoControl from './ArduinoControl'
import SearchPage from './SearchPage'
import ContactPage from './ContactPage'
import SciencePage from './SciencePage'
import SignInPage from './SignInPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/arduino" element={<ArduinoControl />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/science" element={<SciencePage />} />
          <Route path="/signin" element={<SignInPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
