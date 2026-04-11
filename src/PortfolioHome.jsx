import { NavLink, Outlet, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/',               label: 'Home',         icon: '🏠' },
  { to: '/microgreens',    label: 'Microgreens',  icon: '🌱' },
  { to: '/cookie-clicker', label: 'Cookie Clicker', icon: '🍪' },
  { to: '/calculator',     label: 'Calculator',   icon: '🧮' },
  { to: '/arduino',        label: 'Arduino',      icon: '⚡' },
  { to: '/search',         label: 'Search',       icon: '🔍' },
]

function WelcomePanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-8 py-16">
      <div>
        <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-4">
          My{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Project Hub
          </span>
        </h2>
        <p className="text-white/50 text-lg max-w-md mx-auto">
          A collection of web apps, tools, and experiments. Pick a tab above to get started.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl w-full">
        {tabs.slice(1).map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 text-left hover:border-white/15 hover:bg-white/[0.06] transition-all"
          >
            <span className="text-4xl">{t.icon}</span>
            <p className="mt-3 text-lg font-semibold group-hover:text-indigo-300 transition-colors">{t.label}</p>
          </NavLink>
        ))}
        <div className="rounded-xl border-2 border-dashed border-white/[0.08] flex items-center justify-center p-6 text-white/20 text-sm">
          + More soon
        </div>
      </div>
    </div>
  )
}

export default function PortfolioHome() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="h-screen flex flex-col bg-[#0a0a14] text-white overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <h1 className="text-2xl font-extrabold tracking-tight">
          My{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Project Hub
          </span>
        </h1>
        <p className="text-sm text-white/40 mt-1">Apps, tools &amp; experiments</p>
      </div>

      {/* Tab Bar */}
      <nav className="flex items-center gap-1 px-4 mt-4 pb-0 border-b border-white/[0.06] bg-[#0a0a14] shrink-0 overflow-x-auto">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-white/[0.08] text-white border-b-2 border-indigo-400'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`
            }
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        {isHome ? <WelcomePanel /> : <Outlet />}
      </main>
    </div>
  )
}
