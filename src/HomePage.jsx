export default function HomePage() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand">Aminaa Studio</div>
        <nav className="topnav">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main className="hero" id="about">
        <div className="hero-copy">
          <p className="eyebrow">Professional Web Experience</p>
          <h1>Elevating your ideas with clean, modern design.</h1>
          <p className="lead">
            We build trustworthy digital experiences with polished visuals,
            clear messaging, and fast performance.
          </p>
          <a className="cta" href="#contact">Let&apos;s Work Together</a>
        </div>

        <div className="balloon-scene" aria-hidden="true">
          <div className="balloon balloon-red"></div>
          <div className="balloon balloon-blue"></div>
          <div className="balloon balloon-gold"></div>
          <div className="balloon balloon-purple"></div>
        </div>
      </main>

      <section className="services" id="services">
        <article className="card">
          <h2>Brand Identity</h2>
          <p>Professional visual systems that make your business memorable.</p>
        </article>
        <article className="card">
          <h2>Web Development</h2>
          <p>Responsive, high-performance websites built for real business goals.</p>
        </article>
        <article className="card">
          <h2>Growth Strategy</h2>
          <p>Actionable plans to improve reach, engagement, and conversions.</p>
        </article>
      </section>

      <footer className="footer" id="contact">
        <p>© 2026 Aminaa Studio. All rights reserved.</p>
      </footer>
    </div>
  )
}
