import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'

// ── Utility: format time ──
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function formatDate(date) {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ControlCenter() {
  // ── Activity Log (defined early so other sections can log) ──
  const [activityLog, setActivityLog] = useState(() => {
    const saved = localStorage.getItem('cc_activityLog')
    return saved ? JSON.parse(saved) : []
  })
  useEffect(() => { localStorage.setItem('cc_activityLog', JSON.stringify(activityLog.slice(0, 200))) }, [activityLog])

  const addLog = (type, message) => {
    setActivityLog(prev => [{ id: Date.now(), type, message, time: new Date().toISOString() }, ...prev].slice(0, 200))
  }

  const clearLog = () => setActivityLog([])

  const logIcons = { water_manual: '💧', water_auto: '🤖', connection: '🔌', light: '💡' }
  const logColors = {
    water_manual: 'text-blue-400',
    water_auto: 'text-cyan-400',
    connection: 'text-purple-400',
    light: 'text-yellow-400',
  }

  const [logFilter, setLogFilter] = useState('all')
  const filteredLogs = logFilter === 'all' ? activityLog : activityLog.filter(l => l.type === logFilter)

  // ── Webcam ──
  const videoRef = useRef(null)
  const [camActive, setCamActive] = useState(false)
  const [camError, setCamError] = useState(null)
  const camStreamRef = useRef(null)

  const startCam = async () => {
    try {
      setCamError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      camStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCamActive(true)
      addLog('connection', 'Webcam connected')
    } catch (err) {
      setCamError(err.message || 'Camera access denied')
      setCamActive(false)
      addLog('connection', `Webcam failed: ${err.message}`)
    }
  }

  const stopCam = () => {
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach(t => t.stop())
      camStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCamActive(false)
    addLog('connection', 'Webcam disconnected')
  }

  useEffect(() => {
    return () => {
      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])
  // ── Live clock ──
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // ── Toggle states ──
  const [darkMode, setDarkMode] = useState(true)
  const [doNotDisturb, setDoNotDisturb] = useState(false)

  // ── Sliders ──
  const [brightness, setBrightness] = useState(75)
  const [volume, setVolume] = useState(50)

  // ── Stopwatch ──
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [stopwatchMs, setStopwatchMs] = useState(0)
  useEffect(() => {
    if (!stopwatchRunning) return
    const id = setInterval(() => setStopwatchMs(p => p + 10), 10)
    return () => clearInterval(id)
  }, [stopwatchRunning])
  const swMinutes = String(Math.floor(stopwatchMs / 60000)).padStart(2, '0')
  const swSeconds = String(Math.floor((stopwatchMs % 60000) / 1000)).padStart(2, '0')
  const swCentis = String(Math.floor((stopwatchMs % 1000) / 10)).padStart(2, '0')

  // ── Grow Lights (2×8 grid) ──
  const SCHEDULE_ON_HOUR = 6   // lights turn on at 6 AM
  const SCHEDULE_OFF_HOUR = 0  // lights turn off at midnight (18h on, 6h off)
  const isScheduleOn = now.getHours() >= SCHEDULE_ON_HOUR // 6am–midnight = on
  const [lights, setLights] = useState(Array(16).fill(true))
  const [prevSchedule, setPrevSchedule] = useState(isScheduleOn)

  useEffect(() => {
    if (isScheduleOn !== prevSchedule) {
      setLights(Array(16).fill(isScheduleOn))
      setPrevSchedule(isScheduleOn)
      addLog('light', `Schedule: All lights turned ${isScheduleOn ? 'ON' : 'OFF'} (auto)`)
    }
  }, [isScheduleOn, prevSchedule])

  const toggleLight = (idx) => {
    const wasOn = lights[idx]
    setLights(prev => prev.map((v, i) => (i === idx ? !v : v)))
    addLog('light', `Light ${idx + 1} turned ${wasOn ? 'OFF' : 'ON'}`)
  }

  const allOn = lights.every(Boolean)
  const allOff = lights.every(l => !l)
  const toggleAllLights = () => {
    setLights(Array(16).fill(allOn ? false : true))
    addLog('light', `All lights turned ${allOn ? 'OFF' : 'ON'}`)
  }

  // time helpers for schedule display
  const scheduleOnTime = `${String(SCHEDULE_ON_HOUR).padStart(2, '0')}:00`
  const scheduleOffTime = '00:00'
  const nextSwitch = isScheduleOn
    ? (() => { const d = new Date(now); d.setHours(24, 0, 0, 0); return d })()   // midnight
    : (() => { const d = new Date(now); d.setHours(SCHEDULE_ON_HOUR, 0, 0, 0); return d })() // 6am
  const msUntilSwitch = nextSwitch - now
  const hrsLeft = Math.floor(msUntilSwitch / 3600000)
  const minsLeft = Math.floor((msUntilSwitch % 3600000) / 60000)

  // ── Watering Schedule ──
  // Based on aprettierpetal.com guide: water every 12 hours, mist during germination (days 1-4), bottom water after
  const WATER_INTERVAL_MS = 12 * 60 * 60 * 1000 // 12 hours
  const [lastWatered, setLastWatered] = useState(() => {
    const saved = localStorage.getItem('cc_lastWatered')
    return saved ? Number(saved) : Date.now()
  })
  const [growStage, setGrowStage] = useState(() => localStorage.getItem('cc_growStage') || 'germination')

  useEffect(() => { localStorage.setItem('cc_lastWatered', String(lastWatered)) }, [lastWatered])
  useEffect(() => { localStorage.setItem('cc_growStage', growStage) }, [growStage])

  const msSinceWatered = now - lastWatered
  const msUntilWater = Math.max(0, WATER_INTERVAL_MS - msSinceWatered)
  const waterOverdue = msUntilWater === 0

  const fmtDuration = (ms) => {
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  }

  const waterNow = () => {
    setLastWatered(Date.now())
    addLog('water_manual', `Manual watering recorded (${currentStage.label} stage)`)
  }

  const waterProgress = Math.min(100, (msSinceWatered / WATER_INTERVAL_MS) * 100)

  const stages = [
    { key: 'germination', label: 'Germination', days: '1–4', tip: 'Mist gently 1–2× daily. Keep dome on.' },
    { key: 'blackout', label: 'Blackout', days: '4–7', tip: 'Bottom water once daily. Remove dome.' },
    { key: 'growth', label: 'Growth', days: '7–14', tip: 'Bottom water every 12h. Good airflow.' },
    { key: 'harvest', label: 'Harvest', days: '14+', tip: 'Water morning only. Harvest when ready.' },
  ]

  const currentStage = stages.find(s => s.key === growStage) || stages[0]

  // ── Notes ──
  const [note, setNote] = useState(() => localStorage.getItem('cc_note') || '')
  useEffect(() => { localStorage.setItem('cc_note', note) }, [note])

  // ── Arduino Devices ──
  const defaultDevices = [
    { id: 'cam-1', type: 'camera', name: 'Grow Cam 1', port: 'COM3', status: 'disconnected' },
    { id: 'cam-2', type: 'camera', name: 'Grow Cam 2', port: 'COM4', status: 'disconnected' },
    { id: 'water-1', type: 'waterer', name: 'Auto Waterer A', port: 'COM5', status: 'disconnected' },
    { id: 'water-2', type: 'waterer', name: 'Auto Waterer B', port: 'COM6', status: 'disconnected' },
    { id: 'led-1', type: 'led', name: 'LED Strip 1', port: 'COM7', status: 'disconnected' },
    { id: 'led-2', type: 'led', name: 'LED Strip 2', port: 'COM8', status: 'disconnected' },
  ]
  const [devices, setDevices] = useState(() => {
    const saved = localStorage.getItem('cc_arduino_devices')
    return saved ? JSON.parse(saved) : defaultDevices
  })
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [newDevice, setNewDevice] = useState({ name: '', type: 'camera', port: '' })

  useEffect(() => { localStorage.setItem('cc_arduino_devices', JSON.stringify(devices)) }, [devices])

  const toggleDeviceConnection = (id) => {
    const dev = devices.find(d => d.id === id)
    if (!dev) return
    if (dev.status === 'connected') {
      setDevices(prev => prev.map(d =>
        d.id === id ? { ...d, status: 'disconnected' } : d
      ))
      addLog('connection', `${dev.name} (${dev.port}) disconnected`)
    } else {
      setDevices(prev => prev.map(d =>
        d.id === id ? { ...d, status: 'connecting' } : d
      ))
      setTimeout(() => {
        setDevices(prev => prev.map(d =>
          d.id === id ? { ...d, status: 'connected' } : d
        ))
        addLog('connection', `${dev.name} (${dev.port}) connected`)
      }, 1500)
    }
  }

  const removeDevice = (id) => {
    const dev = devices.find(d => d.id === id)
    setDevices(prev => prev.filter(d => d.id !== id))
    if (dev) addLog('connection', `${dev.name} (${dev.port}) removed`)
  }

  const addDevice = () => {
    if (!newDevice.name || !newDevice.port) return
    setDevices(prev => [...prev, {
      id: `${newDevice.type}-${Date.now()}`,
      type: newDevice.type,
      name: newDevice.name,
      port: newDevice.port,
      status: 'disconnected'
    }])
    setNewDevice({ name: '', type: 'camera', port: '' })
    setShowAddDevice(false)
  }

  const deviceIcons = { camera: '📷', waterer: '💧', led: '💡' }
  const deviceColors = {
    camera: { connected: 'from-purple-500 to-indigo-600', dot: 'bg-purple-400' },
    waterer: { connected: 'from-blue-500 to-cyan-600', dot: 'bg-blue-400' },
    led: { connected: 'from-yellow-500 to-amber-600', dot: 'bg-yellow-400' },
  }

  const connectedCount = devices.filter(d => d.status === 'connected').length

  // ── Resizable panels ──
  const [lightsPct, setLightsPct] = useState(() => {
    const s = localStorage.getItem('cc_lightsPct'); return s ? Number(s) : 60
  })
  const [waterPct, setWaterPct] = useState(() => {
    const s = localStorage.getItem('cc_waterPct'); return s ? Number(s) : 50
  })
  useEffect(() => { localStorage.setItem('cc_lightsPct', String(lightsPct)) }, [lightsPct])
  useEffect(() => { localStorage.setItem('cc_waterPct', String(waterPct)) }, [waterPct])

  const leftColRef = useRef(null)
  const bottomRowRef = useRef(null)
  const draggingRef = useRef(null) // 'vertical' | 'horizontal' | null

  const onMouseDown = useCallback((axis) => (e) => {
    e.preventDefault()
    draggingRef.current = axis
    document.body.style.cursor = axis === 'vertical' ? 'row-resize' : 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingRef.current) return
      if (draggingRef.current === 'vertical' && leftColRef.current) {
        const rect = leftColRef.current.getBoundingClientRect()
        const y = e.clientY - rect.top
        const pct = Math.min(85, Math.max(25, (y / rect.height) * 100))
        setLightsPct(pct)
      }
      if (draggingRef.current === 'horizontal' && bottomRowRef.current) {
        const rect = bottomRowRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const pct = Math.min(80, Math.max(20, (x / rect.width) * 100))
        setWaterPct(pct)
      }
    }
    const onMouseUp = () => {
      draggingRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // ── Quick math ──
  const [mathExpr, setMathExpr] = useState('')
  const [mathResult, setMathResult] = useState(null)
  const evalMath = () => {
    try {
      // safe subset: only digits, operators, parens, dots
      if (/^[\d+\-*/().% ]+$/.test(mathExpr)) {
        setMathResult(new Function(`return (${mathExpr})`)())
      } else {
        setMathResult('Invalid')
      }
    } catch { setMathResult('Error') }
  }

  // ── Toggle pill component ──
  const Toggle = ({ on, onToggle, label, icon, color }) => (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 w-full ${
        on
          ? `bg-gradient-to-r ${color} text-white shadow-lg scale-[1.02]`
          : 'bg-white/10 text-white/60 hover:bg-white/15'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-semibold flex-1 text-left">{label}</span>
      <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${on ? 'bg-white/30' : 'bg-white/10'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </div>
    </button>
  )

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex overflow-hidden">
      {/* Cookie Clicker nav button */}
      <Link
        to="/cookie-clicker"
        className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/80 hover:text-white px-6 py-4 rounded-full transition-all border border-white/10 hover:border-white/20 shadow-lg"
        title="Cookie Clicker"
      >
        <span className="text-2xl">🍪</span>
        <span className="text-lg font-semibold hidden sm:inline">Cookie Clicker</span>
      </Link>

      {/* ── Left Column — Grow Lights + Camera ── */}
      <div ref={leftColRef} className="flex-1 flex flex-col p-6 pt-16" style={{ gap: 0 }}>
        {/* Grow Lights 2×8 */}
        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col overflow-hidden" style={{ height: `${lightsPct}%` }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-white/40 font-semibold uppercase tracking-widest">💡 Grow Lights</p>
            <button
              onClick={toggleAllLights}
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/80 transition-all"
            >
              {allOn ? 'All Off' : 'All On'}
            </button>
          </div>

          {/* Schedule indicator */}
          <div className="flex items-center gap-2 mb-5 mt-2">
            <div className={`w-2 h-2 rounded-full ${isScheduleOn ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse' : 'bg-white/20'}`} />
            <span className="text-xs text-white/40">
              Schedule: {scheduleOnTime}–{scheduleOffTime} ·{' '}
              <span className={isScheduleOn ? 'text-yellow-400/80' : 'text-blue-400/80'}>
                {isScheduleOn ? 'ON' : 'OFF'}
              </span>
              {' '}· next switch in {hrsLeft}h {minsLeft}m
            </span>
          </div>

          {/* 2×8 Light Grid — expanded */}
          <div className="grid grid-cols-8 gap-3 flex-1 min-h-0">
            {lights.map((on, idx) => (
              <button
                key={idx}
                onClick={() => toggleLight(idx)}
                className={`rounded-2xl transition-all duration-300 border flex items-center justify-center text-2xl ${
                  on
                    ? 'bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-500/50 shadow-lg shadow-yellow-400/30 scale-[1.03]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                title={`Light ${idx + 1} — ${on ? 'ON' : 'OFF'}`}
              >
                {on ? '💡' : '⚫'}
              </button>
            ))}
          </div>

          {/* Status line */}
          <p className="text-xs text-white/20 mt-4 text-center">
            {lights.filter(Boolean).length}/{lights.length} lights on
          </p>
        </div>

        {/* ── Vertical resize handle ── */}
        <div
          onMouseDown={onMouseDown('vertical')}
          className="flex items-center justify-center cursor-row-resize group py-1 flex-shrink-0 z-10"
          title="Drag to resize"
        >
          <div className="w-16 h-1 rounded-full bg-white/10 group-hover:bg-white/30 group-active:bg-blue-400/60 transition-all" />
        </div>

        {/* ── Watering Schedule + Camera side by side ── */}
        <div ref={bottomRowRef} className="flex overflow-hidden" style={{ height: `${100 - lightsPct}%`, gap: 0 }}>
          {/* Watering Schedule */}
          <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex flex-col overflow-y-auto" style={{ width: `${waterPct}%` }}>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-3">💧 Watering Schedule</p>

            {/* Last watered & Next water */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Last Watered</p>
                <p className="text-lg font-mono text-blue-300 tracking-wide">{fmtDuration(msSinceWatered)}</p>
                <p className="text-[10px] text-white/20 mt-1">{new Date(lastWatered).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className={`bg-white/5 rounded-2xl p-3 text-center border ${waterOverdue ? 'border-red-500/30' : 'border-white/5'}`}>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Next Water</p>
                <p className={`text-lg font-mono tracking-wide ${waterOverdue ? 'text-red-400 animate-pulse' : 'text-emerald-300'}`}>
                  {waterOverdue ? 'OVERDUE' : fmtDuration(msUntilWater)}
                </p>
                <p className="text-[10px] text-white/20 mt-1">every 12 hours</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-white/5 mb-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${waterOverdue ? 'bg-red-500' : 'bg-gradient-to-r from-blue-400 to-cyan-400'}`}
                style={{ width: `${waterProgress}%` }}
              />
            </div>

            {/* Water Now button */}
            <button
              onClick={waterNow}
              className={`w-full py-3 rounded-2xl text-sm font-bold transition-all mb-4 ${
                waterOverdue
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 animate-pulse'
                  : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'
              }`}
            >
              💧 Mark as Watered
            </button>

            {/* Growth Stage selector */}
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Growth Stage</p>
              <div className="grid grid-cols-4 gap-1.5">
                {stages.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setGrowStage(s.key)}
                    className={`py-2 px-1 rounded-xl text-center transition-all border ${
                      growStage === s.key
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-transparent shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[10px] font-bold block">{s.label}</span>
                    <span className="text-[9px] opacity-60">Days {s.days}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-cyan-300/80">💡 {currentStage.tip}</p>
              </div>
            </div>
          </div>

          {/* ── Horizontal resize handle ── */}
          <div
            onMouseDown={onMouseDown('horizontal')}
            className="flex items-center justify-center cursor-col-resize group px-1 flex-shrink-0 z-10"
            title="Drag to resize"
          >
            <div className="h-16 w-1 rounded-full bg-white/10 group-hover:bg-white/30 group-active:bg-blue-400/60 transition-all" />
          </div>

          {/* Microgreen Status Camera */}
          <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex flex-col overflow-hidden" style={{ width: `${100 - waterPct}%` }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">📷 Microgreen Status</p>
              <div className="flex items-center gap-2">
                {camActive && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                    <span className="text-[10px] text-red-400 font-bold uppercase">Live</span>
                  </div>
                )}
                <button
                  onClick={camActive ? stopCam : startCam}
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg transition-all ${
                    camActive
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {camActive ? 'Stop' : 'Start Cam'}
                </button>
              </div>
            </div>
            <div className="flex-1 bg-black/60 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${camActive ? 'block' : 'hidden'}`}
              />
              {!camActive && (
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-4xl opacity-30">📷</span>
                  <span className="text-sm font-semibold text-white/30">
                    {camError ? camError : 'Camera Off'}
                  </span>
                  <span className="text-xs text-white/15">Click “Start Cam” to connect</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Column — Control Widgets ── */}
      <div className="w-[400px] h-screen bg-white/5 backdrop-blur-xl border-l border-white/10 p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-wide">Control Center</h1>
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
        </div>

        {/* ── Display & Sound ── */}
        <div className="bg-white/5 rounded-3xl p-4 flex flex-col gap-3 border border-white/5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white/50 font-medium">☀️ Brightness</span>
              <span className="text-sm font-mono text-white/70">{brightness}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={brightness}
              onChange={e => setBrightness(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-yellow-400"
              style={{ background: `linear-gradient(to right, #facc15 ${brightness}%, rgba(255,255,255,0.1) ${brightness}%)` }}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white/50 font-medium">🔊 Volume</span>
              <span className="text-sm font-mono text-white/70">{volume}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-400"
              style={{ background: `linear-gradient(to right, #60a5fa ${volume}%, rgba(255,255,255,0.1) ${volume}%)` }}
            />
          </div>
        </div>

        {/* ── Mode Toggles ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all duration-300 border ${
              darkMode
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent shadow-lg shadow-purple-500/30'
                : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
            }`}
          >
            <span className="text-2xl">{darkMode ? '🌙' : '☀️'}</span>
            <span className="text-xs font-semibold">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button
            onClick={() => setDoNotDisturb(!doNotDisturb)}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all duration-300 border ${
              doNotDisturb
                ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white border-transparent shadow-lg shadow-rose-500/30'
                : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
            }`}
          >
            <span className="text-2xl">{doNotDisturb ? '🔕' : '🔔'}</span>
            <span className="text-xs font-semibold">{doNotDisturb ? 'DND On' : 'DND Off'}</span>
          </button>
        </div>

        {/* ── Stopwatch + Quick Calc side by side ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-2">⏱ Stopwatch</p>
            <p className="text-xl font-mono text-white text-center tracking-wider mb-3">
              {swMinutes}:{swSeconds}<span className="text-sm text-white/40">.{swCentis}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setStopwatchRunning(!stopwatchRunning)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  stopwatchRunning
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {stopwatchRunning ? 'Stop' : 'Start'}
              </button>
              <button
                onClick={() => { setStopwatchRunning(false); setStopwatchMs(0) }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/5 text-white/50 hover:bg-white/10 transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-3xl p-4 border border-white/5 flex flex-col">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-2">🧮 Quick Calc</p>
            <input
              value={mathExpr}
              onChange={e => setMathExpr(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && evalMath()}
              placeholder="e.g. 42 * 3.14"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-white/20 outline-none focus:border-white/30 transition font-mono mb-2"
            />
            <button
              onClick={evalMath}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20"
            >
              Calculate
            </button>
            {mathResult !== null && (
              <p className="mt-2 text-sm font-mono text-cyan-300 text-center">{String(mathResult)}</p>
            )}
          </div>
        </div>

        {/* ── Arduino Device Hub ── */}
        <div className="bg-white/5 rounded-3xl p-4 border border-white/5 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">🔧 Arduino Devices</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30 font-mono">{connectedCount}/{devices.length}</span>
              <button
                onClick={() => setShowAddDevice(!showAddDevice)}
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/80 transition-all"
              >
                {showAddDevice ? '✕' : '+ Add'}
              </button>
            </div>
          </div>

          {/* Add Device Form */}
          {showAddDevice && (
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10 mb-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={newDevice.name}
                  onChange={e => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="Device name"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-white/20 outline-none focus:border-white/30 transition"
                />
                <input
                  value={newDevice.port}
                  onChange={e => setNewDevice({ ...newDevice, port: e.target.value })}
                  placeholder="COM port"
                  className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-white/20 outline-none focus:border-white/30 transition font-mono"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={newDevice.type}
                  onChange={e => setNewDevice({ ...newDevice, type: e.target.value })}
                  className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none cursor-pointer"
                >
                  <option value="camera">📷 Camera</option>
                  <option value="waterer">💧 Auto Waterer</option>
                  <option value="led">💡 LED Lights</option>
                </select>
                <button
                  onClick={addDevice}
                  className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Device List */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0 pr-1">
            {devices.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                <span className="text-3xl mb-2">🔌</span>
                <p className="text-xs">No devices added</p>
              </div>
            )}
            {devices.map(dev => (
              <div
                key={dev.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border ${
                  dev.status === 'connected'
                    ? `bg-gradient-to-r ${deviceColors[dev.type].connected} border-transparent shadow-md`
                    : dev.status === 'connecting'
                    ? 'bg-white/5 border-yellow-500/30'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{deviceIcons[dev.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${dev.status === 'connected' ? 'text-white' : 'text-white/60'}`}>
                    {dev.name}
                  </p>
                  <p className={`text-[10px] font-mono ${dev.status === 'connected' ? 'text-white/60' : 'text-white/25'}`}>
                    {dev.port}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {dev.status === 'connecting' ? (
                    <span className="text-[10px] text-yellow-400 animate-pulse font-semibold">Connecting...</span>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${dev.status === 'connected' ? `${deviceColors[dev.type].dot} shadow-lg animate-pulse` : 'bg-white/15'}`} />
                  )}
                  <button
                    onClick={() => toggleDeviceConnection(dev.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                      dev.status === 'connected'
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : dev.status === 'connecting'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                    disabled={dev.status === 'connecting'}
                  >
                    {dev.status === 'connected' ? 'Disconnect' : dev.status === 'connecting' ? '...' : 'Connect'}
                  </button>
                  <button
                    onClick={() => removeDevice(dev.id)}
                    className="text-[10px] text-white/20 hover:text-red-400 transition-all px-1"
                    title="Remove device"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Activity Log ── */}
        <div className="bg-white/5 rounded-3xl p-4 border border-white/5 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">📋 Activity Log</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/20 font-mono">{filteredLogs.length}</span>
              <button
                onClick={clearLog}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-white/10 text-white/30 hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 mb-2">
            {[
              { key: 'all', label: 'All', icon: '📋' },
              { key: 'water_manual', label: 'Manual', icon: '💧' },
              { key: 'water_auto', label: 'Auto', icon: '🤖' },
              { key: 'connection', label: 'Devices', icon: '🔌' },
              { key: 'light', label: 'Lights', icon: '💡' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setLogFilter(f.key)}
                className={`text-[9px] font-bold px-2 py-1 rounded-lg transition-all ${
                  logFilter === f.key
                    ? 'bg-white/15 text-white/80'
                    : 'text-white/25 hover:text-white/50 hover:bg-white/5'
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* Log entries */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-1 min-h-0 pr-1">
            {filteredLogs.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-white/15">
                <span className="text-2xl mb-1">📋</span>
                <p className="text-[10px]">No activity yet</p>
              </div>
            )}
            {filteredLogs.map(entry => {
              const t = new Date(entry.time)
              const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              const dateStr = t.toLocaleDateString([], { month: 'short', day: 'numeric' })
              return (
                <div key={entry.id} className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-all">
                  <span className="text-sm mt-0.5">{logIcons[entry.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] ${logColors[entry.type]} leading-tight`}>{entry.message}</p>
                    <p className="text-[9px] text-white/15 font-mono mt-0.5">{dateStr} · {timeStr}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-xs text-white/15">Control Center v1.0</p>
      </div>
    </div>
  )
}
