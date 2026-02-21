import React, { useState } from 'react'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [memory, setMemory] = useState(0)

  const append = value => {
    setDisplay(prev => (prev === '0' || prev === 'Error' ? value : prev + value))
  }

  const calculate = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(display)
      setDisplay(String(result))
    } catch (e) {
      setDisplay('Error')
    }
  }

  const clear = () => setDisplay('0')
  const sqrt = () => {
    try {
      setDisplay(String(Math.sqrt(parseFloat(display))))
    } catch {
      setDisplay('Error')
    }
  }
  const percent = () => {
    try {
      setDisplay(String(parseFloat(display) / 100))
    } catch {
      setDisplay('Error')
    }
  }
  const toggleSign = () => {
    setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)
  }
  const power = () => append('**')
  const pi = () => setDisplay(String(Math.PI))

  // Memory functions
  const memoryClear = () => setMemory(0)
  const memoryRecall = () => setDisplay(String(memory))
  const memorySubtract = () => setMemory(prev => prev - parseFloat(display || 0))
  const memoryAdd = () => setMemory(prev => prev + parseFloat(display || 0))

  const buttonBase = "text-2xl font-semibold rounded-lg transition-all duration-75 active:translate-y-0.5 active:shadow-inner select-none"
  const grayBtn = `${buttonBase} bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 shadow-md border border-gray-300`
  const yellowBtn = `${buttonBase} bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-md border border-amber-600`
  const lightGrayBtn = `${buttonBase} bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-500 shadow border border-gray-200 text-lg`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      {/* Calculator Body */}
      <div 
        className="relative bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl w-full max-w-md"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 5px rgba(0,0,0,0.3)'
        }}
      >
        {/* Solar Panel */}
        <div className="flex justify-center mb-5">
          <div className="flex gap-0.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-8 h-3 bg-gradient-to-b from-indigo-900 to-indigo-950 rounded-sm border border-gray-600" />
            ))}
          </div>
        </div>

        {/* LCD Display */}
        <div 
          className="bg-gradient-to-b from-lime-200 to-lime-100 rounded-lg p-5 mb-5 border-4 border-gray-600"
          style={{
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2), inset 0 -1px 0 rgba(255,255,255,0.5)'
          }}
        >
          <div 
            className="text-right text-5xl font-mono text-gray-800 overflow-hidden min-h-[60px] tracking-wider"
            style={{ fontFamily: "'Segment7', 'Courier New', monospace" }}
          >
            {display}
          </div>
        </div>

        {/* Button Area */}
        <div className="bg-gray-800 rounded-2xl p-4" style={{ boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3)' }}>
          {/* Memory Row */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <button onClick={memoryClear} className={`${lightGrayBtn} py-3`}>MC</button>
            <button onClick={memoryRecall} className={`${lightGrayBtn} py-3`}>MR</button>
            <button onClick={memorySubtract} className={`${lightGrayBtn} py-3`}>M−</button>
            <button onClick={memoryAdd} className={`${lightGrayBtn} py-3`}>M+</button>
          </div>

          {/* Function Row */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <button onClick={clear} className={`${grayBtn} py-4`}>AC</button>
            <button onClick={sqrt} className={`${grayBtn} py-4`}>√</button>
            <button onClick={percent} className={`${grayBtn} py-4`}>%</button>
            <button onClick={() => append('/')} className={`${yellowBtn} py-4`}>÷</button>
          </div>

          {/* Number Rows */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <button onClick={() => append('7')} className={`${grayBtn} py-5`}>7</button>
            <button onClick={() => append('8')} className={`${grayBtn} py-5`}>8</button>
            <button onClick={() => append('9')} className={`${grayBtn} py-5`}>9</button>
            <button onClick={() => append('*')} className={`${yellowBtn} py-5`}>×</button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-3">
            <button onClick={() => append('4')} className={`${grayBtn} py-5`}>4</button>
            <button onClick={() => append('5')} className={`${grayBtn} py-5`}>5</button>
            <button onClick={() => append('6')} className={`${grayBtn} py-5`}>6</button>
            <button onClick={() => append('-')} className={`${yellowBtn} py-5`}>−</button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-3">
            <button onClick={() => append('1')} className={`${grayBtn} py-5`}>1</button>
            <button onClick={() => append('2')} className={`${grayBtn} py-5`}>2</button>
            <button onClick={() => append('3')} className={`${grayBtn} py-5`}>3</button>
            <button onClick={() => append('+')} className={`${yellowBtn} py-5`}>+</button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => append('0')} className={`${grayBtn} py-5 col-span-2`}>0</button>
            <button onClick={() => append('.')} className={`${grayBtn} py-5`}>.</button>
            <button onClick={calculate} className={`${yellowBtn} py-5`}>=</button>
          </div>
        </div>

        {/* Back to home link */}
        <a
          href="/"
          className="block text-center mt-5 text-gray-400 hover:text-gray-200 text-sm transition"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  )
}