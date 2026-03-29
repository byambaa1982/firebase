import { Link, useParams, useNavigate } from 'react-router-dom'
import NavUser from './NavUser'

import bladder from './assets/bladder.png'
import brain from './assets/Brain.png'
import heart from './assets/Heart.png'
import intestines from './assets/intestines.png'
import kidneys from './assets/Kidneys.png'
import liver from './assets/Liver.png'
import lungs from './assets/lungs.png'
import pancreas from './assets/pancreas.png'
import stomach from './assets/stomach.png'

const organData = {
  brain:      { name: 'Brain',      img: brain },
  heart:      { name: 'Heart',      img: heart },
  lungs:      { name: 'Lungs',      img: lungs },
  liver:      { name: 'Liver',      img: liver },
  kidneys:    { name: 'Kidneys',    img: kidneys },
  stomach:    { name: 'Stomach',    img: stomach },
  pancreas:   { name: 'Pancreas',   img: pancreas },
  intestines: { name: 'Intestines', img: intestines },
  bladder:    { name: 'Bladder',    img: bladder },
}

export default function OrganPage() {
  const { organ } = useParams()
  const navigate = useNavigate()
  const data = organData[organ?.toLowerCase()]

  if (!data) {
    return (
      <div className="site-shell" style={{ backgroundColor: '#0d1b2a', minHeight: '100vh', color: '#fff' }}>
        <header className="topbar">
          <div className="brand">Aminaa Studio</div>
          <nav className="topnav">
            <Link to="/">Home</Link>
            <Link to="/science">Science</Link>
            <Link to="/contact">Contact</Link>
            <NavUser />
          </nav>
        </header>
        <main style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>Organ not found.</h2>
          <button onClick={() => navigate('/science')} style={{ marginTop: '1rem', cursor: 'pointer' }}>
            ← Back to Science
          </button>
        </main>
      </div>
    )
  }

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
        <button
          onClick={() => navigate('/science')}
          style={{
            alignSelf: 'flex-start',
            marginBottom: '1.5rem',
            background: 'none',
            border: '1px solid #4fc3f7',
            color: '#4fc3f7',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ← Back
        </button>

        <div style={{
          width: '100%',
          maxWidth: '750px',
          backgroundColor: '#1a2c3d',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>
          <img
            src={data.img}
            alt={data.name}
            style={{ width: '220px', borderRadius: '12px', flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
          />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{ color: '#4fc3f7', marginTop: 0 }}>{data.name}</h1>
            <p style={{ color: '#b0bec5', fontStyle: 'italic', lineHeight: '1.7' }}>
              Description coming soon...
            </p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Aminaa Studio. All rights reserved.</p>
      </footer>
    </div>
  )
}
