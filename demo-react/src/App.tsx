import { useEffect, useRef, useState } from 'react'
import { mountZigCel } from './zigcel.js' // Import the built lib
import './App.css'

function App() {
  const zigCelRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState("Loading WASM...");

  useEffect(() => {
    async function init() {
      if (zigCelRef.current) {
        try {
          // Mount the WASM engine. Note the URL path targets React's public folder '/zigcel.wasm'
          await mountZigCel(zigCelRef.current, '/zigcel.wasm');
          setStatus("WASM Ready / React Component Mounted!");
        } catch (e) {
          setStatus("Error Loading WASM!");
          console.error(e);
        }
      }
    }
    init();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <header style={{ padding: '1rem', background: '#61dafb', color: '#282c34', fontWeight: 'bold' }}>
        React + ZigCel Demo: {status}
      </header>
      <div style={{ flex: 1, position: 'relative' }}>
        {/* We use ts-ignore or declare the custom element type globally later */}
        {/* @ts-ignore */}
        <zig-cel ref={zigCelRef}></zig-cel>
      </div>
    </div>
  )
}

export default App
