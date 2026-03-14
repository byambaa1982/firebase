import { Link } from 'react-router-dom'
import NavUser from './NavUser'

export default function SciencePage() {
  return (
    <div className="site-shell" style={{ backgroundColor: '#0d1b2a', minHeight: '100vh' }}>
      <header className="topbar">
        <div className="brand">Aminaa Studio</div>
        <nav className="topnav">
          <Link to="/">Home</Link>
          <Link to="/science">Science</Link>
          <Link to="/contact">Contact</Link>
          <NavUser />
        </nav>
      </header>

      <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: '#ffffff', marginBottom: '1.5rem' }}>Science</h1>
        <img
          src="/science.png"
          alt="Science"
          style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
        />
      </main>

      <footer className="footer">
        <p>© 2026 Aminaa Studio. All rights reserved.</p>
      </footer>
    </div>
  )
}
