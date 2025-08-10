import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Wundrsight</h1>
          <p className="text-lg text-gray-600">Appointment Booking App</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center space-x-8 mb-8">
            <a href="https://vite.dev" target="_blank" className="hover:scale-110 transition-transform">
              <img src={viteLogo} className="logo w-16 h-16" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank" className="hover:scale-110 transition-transform">
              <img src={reactLogo} className="logo react w-16 h-16" alt="React logo" />
            </a>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Vite + React</h2>
            <div className="card">
              <button 
                onClick={() => setCount((count) => count + 1)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-4"
              >
                count is {count}
              </button>
              <p className="text-gray-600 mb-2">
                Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/App.jsx</code> and save to test HMR
              </p>
            </div>
            <p className="read-the-docs text-gray-500">
              Click on the Vite and React logos to learn more
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
