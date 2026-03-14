import { useState } from 'react'
import { Link } from 'react-router-dom'
import NavUser from './NavUser'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand">Aminaa Studio</div>
        <nav className="topnav">
          <Link to="/">Home</Link>
          <Link to="/contact">Contact</Link>
          <NavUser />
        </nav>
      </header>

      <main style={{ marginTop: '2rem' }}>
        <div className="contact-hero">
          <p className="eyebrow" style={{ color: '#2563eb', opacity: 1 }}>Get In Touch</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', margin: '0.4rem 0 0.8rem' }}>
            Let&apos;s build something great together.
          </h1>
          <p style={{ color: '#475569', maxWidth: '50ch', margin: '0 auto 2rem' }}>
            Have a project in mind? Fill out the form below and I&apos;ll get back to you within 24 hours.
          </p>

          {submitted ? (
            <div className="success-box">
              <h2>✅ Message Sent!</h2>
              <p>Thanks, {form.name}! I&apos;ll be in touch at <strong>{form.email}</strong> soon.</p>
              <button className="cta" onClick={() => setSubmitted(false)} style={{ marginTop: '1rem', border: 'none', cursor: 'pointer' }}>
                Send Another
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell me about your project..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="cta" style={{ border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                Send Message
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="footer" style={{ marginTop: '3rem' }}>
        <p>© 2026 Aminaa Studio. All rights reserved.</p>
      </footer>
    </div>
  )
}
