import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ArduinoControl() {
  const [ledStates, setLedStates] = useState({ led1: false, led2: false, led3: false })
  const [pwmValue, setPwmValue] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  const toggleLed = (led) => {
    setLedStates(prev => ({ ...prev, [led]: !prev[led] }))
    console.log(`Toggle ${led}: ${!ledStates[led]}`)
  }

  const handlePwmChange = (value) => {
    setPwmValue(value)
    console.log(`PWM value: ${value}`)
  }

  const connectArduino = () => {
    setConnectionStatus('connecting')
    setTimeout(() => setConnectionStatus('connected'), 1000)
  }

  const disconnectArduino = () => {
    setConnectionStatus('disconnected')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Arduino Control
          </h1>
          <Link
            to="/"
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition"
          >
            ← Back
          </Link>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              connectionStatus === 'connected' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50' : 
              'bg-red-500 shadow-lg shadow-red-500/50'
            }`}></div>
            <span className="font-medium text-gray-700 capitalize">{connectionStatus}</span>
          </div>
          {connectionStatus === 'disconnected' ? (
            <button
              onClick={connectArduino}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-5 py-2 rounded-full transition font-medium shadow-lg"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnectArduino}
              className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-full transition font-medium"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* LED Controls */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">Digital Pins</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'led1', pin: 9, color: 'from-red-400 to-red-500' },
              { id: 'led2', pin: 10, color: 'from-yellow-400 to-orange-500' },
              { id: 'led3', pin: 11, color: 'from-green-400 to-emerald-500' }
            ].map(({ id, pin, color }) => (
              <button
                key={id}
                onClick={() => toggleLed(id)}
                disabled={connectionStatus !== 'connected'}
                className={`p-4 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2 ${
                  ledStates[id]
                    ? `bg-gradient-to-br ${color} border-transparent text-white shadow-lg scale-105`
                    : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                } ${connectionStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="font-bold text-lg">{ledStates[id] ? 'ON' : 'OFF'}</span>
                <span className="text-xs mt-1 opacity-75">Pin {pin}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PWM Slider */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">PWM Control (Pin 6)</h3>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <input
              type="range"
              min="0"
              max="255"
              value={pwmValue}
              onChange={(e) => handlePwmChange(Number(e.target.value))}
              disabled={connectionStatus !== 'connected'}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">0</span>
              <span className="font-mono font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">{pwmValue}</span>
              <span className="text-xs text-gray-500">255</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Connect your Arduino via Web Serial API to control pins remotely.
        </p>
      </div>
    </div>
  )
}
