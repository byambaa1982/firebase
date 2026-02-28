import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { signInWithGoogle, signOut, onAuthStateChanged, saveGameToCloud, loadGameFromCloud } from './firebase'

const GOLDEN_COOKIE_SPAWN_INTERVAL = 120000 // 2 minutes
const GOLDEN_COOKIE_LIFETIME = 4000         // 4 seconds visible

// Golden cookie effect types (matching Cookie Clicker)
const GC_EFFECTS = {
  frenzy:       { label: 'Frenzy',        emoji: '🔥', cpsMult: 7,   clickMult: 1,   duration: 77000, desc: 'Cookie production x7 for 77 seconds!' },
  lucky:        { label: 'Lucky!',        emoji: '🍀', cpsMult: 1,   clickMult: 1,   duration: 0,     desc: '' }, // instant, no duration
  clickFrenzy:  { label: 'Click Frenzy',  emoji: '🖱️', cpsMult: 1,   clickMult: 777, duration: 13000, desc: 'Clicking power x777 for 13 seconds!' },
}
// Weighted random: Frenzy ~50%, Lucky ~35%, Click Frenzy ~15%
const GC_WEIGHT_TABLE = [
  ...Array(50).fill('frenzy'),
  ...Array(35).fill('lucky'),
  ...Array(15).fill('clickFrenzy'),
]

const LOCAL_STORAGE_KEY = 'cookieClickerSave'

// ── Building definitions (Cookie Clicker style, up to Mine) ──
const BUILDINGS = [
  { id: 'cursor',  name: 'Cursor',  icon: '🖱️', baseCost: 15,    baseCps: 0.1,  color: 'sky',     desc: 'Auto-clicks once every 10 seconds' },
  { id: 'grandma', name: 'Grandma', icon: '👵',  baseCost: 100,   baseCps: 1,    color: 'pink',    desc: 'A nice grandma to bake cookies' },
  { id: 'farm',    name: 'Farm',    icon: '🌾',  baseCost: 1100,  baseCps: 8,    color: 'lime',    desc: 'Grows cookie plants from cookie seeds' },
  { id: 'mine',    name: 'Mine',    icon: '⛏️',  baseCost: 12000, baseCps: 47,   color: 'amber',   desc: 'Mines out cookie dough and chips' },
]

// ── Upgrade definitions ──
const UPGRADES = [
  // Click upgrades
  { id: 'click1', type: 'click', requires: { building: 'cursor', count: 1 },  cost: 100,     mult: 2, label: 'Reinforced Index Finger', desc: 'Click power x2' },
  { id: 'click2', type: 'click', requires: { building: 'cursor', count: 10 }, cost: 500,     mult: 2, label: 'Carpal Tunnel Prevention', desc: 'Click power x2' },
  { id: 'click3', type: 'click', requires: { building: 'cursor', count: 25 }, cost: 10000,   mult: 2, label: 'Ambidextrous',             desc: 'Click power x2' },
  // Cursor upgrades
  { id: 'cur1', type: 'building', building: 'cursor',  requires: { building: 'cursor',  count: 1 },  cost: 100,     mult: 2, label: 'Thousand Fingers',  desc: 'Cursors are twice as efficient' },
  { id: 'cur2', type: 'building', building: 'cursor',  requires: { building: 'cursor',  count: 10 }, cost: 500,     mult: 2, label: 'Million Fingers',   desc: 'Cursors are twice as efficient' },
  // Grandma upgrades
  { id: 'gra1', type: 'building', building: 'grandma', requires: { building: 'grandma', count: 1 },  cost: 1000,    mult: 2, label: 'Forwards from Grandma', desc: 'Grandmas are twice as efficient' },
  { id: 'gra2', type: 'building', building: 'grandma', requires: { building: 'grandma', count: 10 }, cost: 5000,    mult: 2, label: 'Steel-plated Rolling Pins', desc: 'Grandmas are twice as efficient' },
  // Farm upgrades
  { id: 'far1', type: 'building', building: 'farm',    requires: { building: 'farm',    count: 1 },  cost: 11000,   mult: 2, label: 'Cheap Hoes',        desc: 'Farms are twice as efficient' },
  { id: 'far2', type: 'building', building: 'farm',    requires: { building: 'farm',    count: 10 }, cost: 55000,   mult: 2, label: 'Fertilizer',        desc: 'Farms are twice as efficient' },
  // Mine upgrades
  { id: 'min1', type: 'building', building: 'mine',    requires: { building: 'mine',    count: 1 },  cost: 120000,  mult: 2, label: 'Sugar Gas',         desc: 'Mines are twice as efficient' },
  { id: 'min2', type: 'building', building: 'mine',    requires: { building: 'mine',    count: 10 }, cost: 600000,  mult: 2, label: 'Megadrill',         desc: 'Mines are twice as efficient' },
]

function getDefaultState() {
  return {
    cookieCount: 0,
    totalCookies: 0,
    clickMultiplier: 1,
    buildings: Object.fromEntries(BUILDINGS.map(b => [b.id, 0])),
    buildingMultipliers: Object.fromEntries(BUILDINGS.map(b => [b.id, 1])),
    upgradesBought: [],
  }
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Merge with defaults for any missing keys
      const def = getDefaultState()
      return {
        ...def,
        ...parsed,
        buildings: { ...def.buildings, ...(parsed.buildings || {}) },
        buildingMultipliers: { ...def.buildingMultipliers, ...(parsed.buildingMultipliers || {}) },
      }
    }
  } catch {}
  return null
}

function saveLocal(state) {
  try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state)) } catch {}
}

function formatNum(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T'
  if (n >= 1e9)  return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6)  return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K'
  return Math.floor(n).toLocaleString()
}

function getCost(building, owned) {
  return Math.ceil(building.baseCost * Math.pow(1.15, owned))
}

// ── Component ──
export default function HomePage() {
  const [user, setUser] = useState(null)

  const init = loadLocal() || getDefaultState()
  const [cookieCount, setCookieCount] = useState(init.cookieCount)
  const [totalCookies, setTotalCookies] = useState(init.totalCookies ?? 0)
  const [clickMultiplier, setClickMultiplier] = useState(init.clickMultiplier)
  const [buildings, setBuildings] = useState(init.buildings)
  const [buildingMultipliers, setBuildingMultipliers] = useState(init.buildingMultipliers)
  const [upgradesBought, setUpgradesBought] = useState(init.upgradesBought)

  // ── Golden cookie & buff state ──
  const [goldenCookie, setGoldenCookie] = useState(null) // { x, y, spawnedAt }
  const [activeBuffs, setActiveBuffs] = useState([]) // [{ type, endsAt }]
  const [luckyPopup, setLuckyPopup] = useState(null) // { amount, fadingAt }

  // Compute effective multipliers from all active buffs
  const now = Date.now()
  const liveBuffs = activeBuffs.filter(b => now < b.endsAt)
  const cpsFrenzyMult = liveBuffs.reduce((m, b) => m * GC_EFFECTS[b.type].cpsMult, 1)
  const clickFrenzyMult = liveBuffs.reduce((m, b) => m * GC_EFFECTS[b.type].clickMult, 1)

  // Derived: CPS
  const baseCps = BUILDINGS.reduce((sum, b) => {
    return sum + b.baseCps * (buildings[b.id] || 0) * (buildingMultipliers[b.id] || 1)
  }, 0)
  const cps = baseCps * cpsFrenzyMult

  // State ref for saving
  const stateRef = useRef()
  stateRef.current = { cookieCount, totalCookies, clickMultiplier, buildings, buildingMultipliers, upgradesBought }

  // ── Passive income (10 ticks/sec for smooth counting) ──
  const cpsRef = useRef(cps)
  cpsRef.current = cps
  useEffect(() => {
    const interval = setInterval(() => {
      const currentCps = cpsRef.current
      if (currentCps === 0) return
      const gain = currentCps / 10
      setCookieCount(c => c + gain)
      setTotalCookies(t => t + gain)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // ── Golden cookie spawn logic ──
  const spawnGoldenCookie = useCallback(() => {
    const x = 10 + Math.random() * 75 // 10%-85% from left
    const y = 10 + Math.random() * 70 // 10%-80% from top
    setGoldenCookie({ x, y, spawnedAt: Date.now() })
    setTimeout(() => {
      setGoldenCookie(prev => {
        if (prev && Date.now() - prev.spawnedAt >= GOLDEN_COOKIE_LIFETIME - 100) return null
        return prev
      })
    }, GOLDEN_COOKIE_LIFETIME)
  }, [])

  // Auto-spawn every 2 minutes
  useEffect(() => {
    const interval = setInterval(spawnGoldenCookie, GOLDEN_COOKIE_SPAWN_INTERVAL)
    return () => clearInterval(interval)
  }, [spawnGoldenCookie])

  // ── Force re-render when buffs are active (for countdowns) ──
  const [, setTick] = useState(0)
  useEffect(() => {
    if (liveBuffs.length === 0) return
    const interval = setInterval(() => {
      setActiveBuffs(prev => prev.filter(b => Date.now() < b.endsAt))
      setTick(t => t + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [liveBuffs.length])

  const clickGoldenCookie = useCallback(() => {
    setGoldenCookie(null)
    // Pick random effect
    const effectKey = GC_WEIGHT_TABLE[Math.floor(Math.random() * GC_WEIGHT_TABLE.length)]
    const effect = GC_EFFECTS[effectKey]

    if (effectKey === 'lucky') {
      // Lucky! — instant cookies = min(bank * 15%, rawCPS * 900) + 13
      const rawCps = cpsRef.current
      const bankPortion = stateRef.current.cookieCount * 0.15
      const cpsPortion = rawCps * 900
      const gain = Math.max(Math.floor(Math.min(bankPortion, cpsPortion) + 13), 13)
      setCookieCount(c => c + gain)
      setTotalCookies(t => t + gain)
      setLuckyPopup({ amount: gain, fadingAt: Date.now() + 3000 })
      setTimeout(() => setLuckyPopup(null), 3000)
    } else {
      // Timed buff (Frenzy or Click Frenzy)
      setActiveBuffs(prev => {
        // Replace same type or add new
        const filtered = prev.filter(b => b.type !== effectKey)
        return [...filtered, { type: effectKey, endsAt: Date.now() + effect.duration }]
      })
    }
  }, [])

  // ── Save: localStorage every 30s + beforeunload ──
  useEffect(() => {
    const interval = setInterval(() => saveLocal(stateRef.current), 30000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const h = () => saveLocal(stateRef.current)
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [])

  // ── Auth + cloud save/load ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (u) => {
      setUser(u)
      if (u) {
        const cloud = await loadGameFromCloud(u.uid)
        if (cloud) {
          const local = stateRef.current
          const data = (cloud.totalCookies || 0) > (local.totalCookies || 0) ? cloud : local
          const def = getDefaultState()
          setCookieCount(data.cookieCount ?? 0)
          setTotalCookies(data.totalCookies ?? 0)
          setClickMultiplier(data.clickMultiplier ?? 1)
          setBuildings({ ...def.buildings, ...(data.buildings || {}) })
          setBuildingMultipliers({ ...def.buildingMultipliers, ...(data.buildingMultipliers || {}) })
          setUpgradesBought(data.upgradesBought ?? [])
        }
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => saveGameToCloud(user.uid, stateRef.current), 30000)
    return () => clearInterval(interval)
  }, [user])

  // ── Actions ──
  const handleClick = () => {
    const gain = clickMultiplier * clickFrenzyMult
    setCookieCount(c => c + gain)
    setTotalCookies(t => t + gain)
  }

  const buyBuilding = (b) => {
    const cost = getCost(b, buildings[b.id] || 0)
    if (cookieCount >= cost) {
      setCookieCount(c => c - cost)
      setBuildings(prev => ({ ...prev, [b.id]: (prev[b.id] || 0) + 1 }))
    }
  }

  const buyUpgrade = (upgrade) => {
    if (cookieCount >= upgrade.cost && !upgradesBought.includes(upgrade.id)) {
      setCookieCount(c => c - upgrade.cost)
      setUpgradesBought(prev => [...prev, upgrade.id])
      if (upgrade.type === 'click') {
        setClickMultiplier(m => m * upgrade.mult)
      } else if (upgrade.type === 'building') {
        setBuildingMultipliers(prev => ({
          ...prev,
          [upgrade.building]: (prev[upgrade.building] || 1) * upgrade.mult,
        }))
      }
    }
  }

  const handleSignIn = async () => {
    try { await signInWithGoogle() } catch (err) { console.error('Sign in failed', err) }
  }
  const handleSignOut = async () => {
    try {
      if (user) await saveGameToCloud(user.uid, stateRef.current)
      await signOut()
    } catch (err) { console.error('Sign out failed', err) }
  }

  // ── Available upgrades (unlocked but not yet bought) ──
  const availableUpgrades = UPGRADES.filter(u =>
    !upgradesBought.includes(u.id) &&
    (buildings[u.requires.building] || 0) >= u.requires.count
  )

  // ── Color helpers ──
  const colorMap = {
    sky:    { border: 'border-sky-500/30',    hoverBg: 'hover:bg-sky-500/10',    hoverBorder: 'hover:border-sky-400/50',    cps: 'text-sky-400' },
    pink:   { border: 'border-pink-500/30',   hoverBg: 'hover:bg-pink-500/10',   hoverBorder: 'hover:border-pink-400/50',   cps: 'text-pink-400' },
    lime:   { border: 'border-lime-500/30',   hoverBg: 'hover:bg-lime-500/10',   hoverBorder: 'hover:border-lime-400/50',   cps: 'text-lime-400' },
    amber:  { border: 'border-amber-500/30',  hoverBg: 'hover:bg-amber-500/10',  hoverBorder: 'hover:border-amber-400/50',  cps: 'text-amber-400' },
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex relative">

      {/* Back to Control Center button */}
      <Link
        to="/"
        className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/80 hover:text-white px-6 py-4 rounded-full transition-all border border-white/10 hover:border-white/20 shadow-lg"
        title="Control Center"
      >
        <span className="text-2xl">🎛️</span>
        <span className="text-lg font-semibold hidden sm:inline">← Control Center</span>
      </Link>

      {/* Golden Cookie */}
      {goldenCookie && (
        <button
          onClick={clickGoldenCookie}
          className="fixed z-50 cursor-pointer select-none
                     hover:scale-125 transition-transform duration-150"
          style={{
            left: `${goldenCookie.x}%`,
            top: `${goldenCookie.y}%`,
            animation: `goldenBounce 1s ease-in-out infinite, goldenFadeIn 0.3s ease-out, goldenFadeOut 1s ease-in ${(GOLDEN_COOKIE_LIFETIME - 1000) / 1000}s forwards`,
          }}
          title="Click me!"
        >
          <span className="text-6xl drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">🍪</span>
          <span className="absolute -top-1 -right-1 text-lg">✨</span>
        </button>
      )}

      {/* Lucky! popup */}
      {luckyPopup && (
        <div
          className="fixed z-50 left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2
                     pointer-events-none text-center"
          style={{ animation: 'luckyFloat 3s ease-out forwards' }}
        >
          <div className="text-5xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]">
            🍀 Lucky!
          </div>
          <div className="text-2xl font-bold text-green-300 mt-1">
            +{Math.floor(luckyPopup.amount).toLocaleString()} cookies!
          </div>
        </div>
      )}

      {/* Active buff indicators */}
      {liveBuffs.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-2 items-center">
          {liveBuffs.map(buff => {
            const effect = GC_EFFECTS[buff.type]
            const remaining = Math.ceil((buff.endsAt - Date.now()) / 1000)
            const colorClass = buff.type === 'frenzy'
              ? 'from-yellow-500/90 to-amber-500/90 shadow-yellow-500/30'
              : 'from-violet-500/90 to-fuchsia-500/90 shadow-violet-500/30'
            return (
              <div
                key={buff.type}
                className={`bg-gradient-to-r ${colorClass} backdrop-blur
                            text-white font-bold px-6 py-2 rounded-full shadow-lg
                            animate-pulse text-sm whitespace-nowrap`}
              >
                {effect.emoji} {effect.label} — {remaining}s remaining
              </div>
            )
          })}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

      {/* Hero — cookie centered */}
      <section className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-16">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-72 h-72 rounded-full bg-amber-500/20 blur-3xl" />
          <img
            src="/cookie.svg"
            alt="Cookie"
            className="relative w-56 h-56 md:w-72 md:h-72 drop-shadow-[0_0_60px_rgba(234,170,50,0.35)] cursor-pointer select-none
                       hover:scale-105 active:scale-95 transition-transform duration-200"
            onClick={handleClick}
          />
        </div>

        <div className="flex flex-col items-center">
          <span className="text-7xl md:text-8xl font-black tabular-nums tracking-tight
                           bg-gradient-to-b from-amber-300 via-orange-400 to-amber-600
                           bg-clip-text text-transparent">
            {Math.floor(cookieCount).toLocaleString()}
          </span>
          <span className="mt-1 text-sm font-medium uppercase tracking-[0.35em] text-white/50">
            cookies
          </span>
          {cps > 0 && (
            <span className="mt-1 text-xs text-emerald-400/70">
              per second: {cps.toFixed(1)}
            </span>
          )}
          {clickMultiplier > 1 && (
            <span className="text-xs text-amber-400/50">
              click power: {clickMultiplier}
            </span>
          )}
        </div>

        {/* Test button */}
        <button
          onClick={spawnGoldenCookie}
          className="mt-4 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300/80 border border-yellow-500/30 px-4 py-1.5 rounded-full transition"
        >
          🍪 Spawn Golden Cookie
        </button>
      </section>

      {/* Upgrades (only shown when available) */}
      {availableUpgrades.length > 0 && (
        <section className="mx-auto w-full max-w-2xl px-4 pb-4">
          <h2 className="text-lg font-bold text-amber-400/80 uppercase tracking-widest mb-3 text-center">
            Upgrades
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableUpgrades.map(u => {
              const canAfford = cookieCount >= u.cost
              return (
                <button
                  key={u.id}
                  onClick={() => buyUpgrade(u)}
                  disabled={!canAfford}
                  className={`rounded-2xl border p-4 flex flex-col items-center gap-1 transition-all duration-200
                    ${canAfford
                      ? 'bg-white/[0.06] border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-400/50 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer'
                      : 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
                    }`}
                >
                  <span className="font-bold text-sm text-white/90 text-center leading-tight">{u.label}</span>
                  <span className="text-[11px] text-white/40 text-center">{u.desc}</span>
                  <span className="text-sm font-bold text-amber-400 mt-1">{formatNum(u.cost)} 🍪</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Shop — buildings */}
      <section className="mx-auto w-full max-w-2xl px-4 pb-6">
        <h2 className="text-lg font-bold text-white/70 uppercase tracking-widest mb-3 text-center">
          Buildings
        </h2>
        <div className="space-y-3">
          {BUILDINGS.map(b => {
            const owned = buildings[b.id] || 0
            const cost = getCost(b, owned)
            const canAfford = cookieCount >= cost
            const c = colorMap[b.color]
            const effectiveCps = b.baseCps * (buildingMultipliers[b.id] || 1)

            return (
              <button
                key={b.id}
                onClick={() => buyBuilding(b)}
                disabled={!canAfford}
                className={`w-full rounded-2xl border p-5 flex items-center gap-5 transition-all duration-200
                  ${canAfford
                    ? `bg-white/[0.06] ${c.border} ${c.hoverBg} ${c.hoverBorder} hover:-translate-y-0.5 hover:shadow-lg cursor-pointer`
                    : 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
                  }`}
              >
                <span className="text-4xl">{b.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-bold text-base text-white/90">{b.name}</div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {b.desc} — <span className={c.cps}>{effectiveCps.toFixed(1)} cps each</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-amber-400">{formatNum(cost)} 🍪</div>
                  <div className="text-xs text-white/30">owned: {owned}</div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Save your progress */}
      <section className="mx-auto w-full max-w-2xl px-4 pb-16">
        <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10
                        shadow-[0_8px_40px_rgba(0,0,0,0.35)] p-8 md:p-10">

          <h2 className="text-xl font-bold text-center mb-1">
            Save Your Progress
          </h2>
          <p className="text-center text-white/40 text-sm mb-6">
            Sign in to save your cookies across devices
          </p>

          <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-5">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/80 font-medium truncate">
                  Hello, {user.displayName || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white/80
                             text-sm font-medium px-5 py-2 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-600
                           hover:from-rose-600 hover:to-pink-700 text-white font-bold
                           py-3.5 transition shadow-lg shadow-rose-500/25"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          &copy; {new Date().getFullYear()} Cookie Clicker &middot; Built with React &amp; Vite
        </p>
      </section>

      </div>{/* end main content */}

    </div>
  )
}
