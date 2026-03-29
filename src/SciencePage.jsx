import { Link, useNavigate } from 'react-router-dom'
import NavUser from './NavUser'
import mainImg from './assets/main.png'

// Each hotspot is positioned as % of the image width/height,
// matching the organ label cards visible on main.png.
const hotspots = [
  { slug: 'brain',      label: 'Brain',      top: '5%',  left: '1%',  width: '21%', height: '14%' },
  { slug: 'heart',      label: 'Heart',      top: '10%', left: '70%', width: '28%', height: '14%' },
  { slug: 'lungs',      label: 'Lungs',      top: '32%', left: '1%',  width: '21%', height: '13%' },
  { slug: 'liver',      label: 'Liver',      top: '32%', left: '69%', width: '28%', height: '13%' },
  { slug: 'kidneys',    label: 'Kidneys',    top: '50%', left: '1%',  width: '21%', height: '13%' },
  { slug: 'stomach',    label: 'Stomach',    top: '49%', left: '69%', width: '28%', height: '14%' },
  { slug: 'pancreas',   label: 'Pancreas',   top: '66%', left: '1%',  width: '22%', height: '12%' },
  { slug: 'intestines', label: 'Intestines', top: '65%', left: '65%', width: '33%', height: '14%' },
  { slug: 'bladder',    label: 'Bladder',    top: '80%', left: '1%',  width: '21%', height: '13%' },
]

export default function SciencePage() {
  const navigate = useNavigate()

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
        <h1 style={{ color: '#ffffff', marginBottom: '1.5rem' }}>Human Anatomy</h1>
        <p style={{ color: '#90a4ae', marginBottom: '1.5rem' }}>
          Click any organ label to learn more.
        </p>

        {/* Main image with overlaid hotspots */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
          <img
            src={mainImg}
            alt="Human Anatomy"
            style={{ width: '100%', display: 'block', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          />

          {hotspots.map(hs => (
            <div
              key={hs.slug}
              title={hs.label}
              onClick={() => navigate(`/science/${hs.slug}`)}
              style={{
                position: 'absolute',
                top: hs.top,
                left: hs.left,
                width: hs.width,
                height: hs.height,
                cursor: 'pointer',
                borderRadius: '8px',
                border: '2px solid rgba(79,195,247,0.5)',
                background: 'rgba(79,195,247,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = '2px solid #4fc3f7'
                e.currentTarget.style.background = 'rgba(79,195,247,0.25)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = '2px solid rgba(79,195,247,0.5)'
                e.currentTarget.style.background = 'rgba(79,195,247,0.08)'
              }}
            >
              <span style={{
                color: '#4fc3f7',
                fontSize: 'clamp(8px, 1.2vw, 13px)',
                fontWeight: 'bold',
                textShadow: '0 0 6px #000',
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                {hs.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Aminaa Studio. All rights reserved.</p>
      </footer>
    </div>
  )
}
