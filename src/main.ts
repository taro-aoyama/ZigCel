import './style.css'
// Initialize web component
import './ZigCelElement';
import type { WasmEngine } from './ZigCelElement';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
    <header style="padding: 10px; background: #333; color: white;">
        <h1 style="margin: 0; font-size: 1.5rem; display: inline-block; margin-right: 20px;">ZigCel Prototype</h1>
        <button id="calc-btn" type="button">WASM Calc Test (5 + 7)</button>
        <span id="result" style="margin-left: 10px;"></span>
    </header>
    
    <!-- Here is the Web Component Mount Point -->
    <main style="flex: 1; min-height: 0; position: relative;">
        <zig-cel></zig-cel>
    </main>
  </div>
`

// WASM initialization and interaction
async function initWasm() {
    try {
        // Fetch and instantiate the WASM module with a cache buster
        const response = await fetch('/zigcel.wasm?t=' + Date.now());
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.instantiate(buffer, {
            env: { }
        });

        const exports = module.instance.exports as any;
        const engine: WasmEngine = {
            memory: exports.memory,
            initEngine: exports.initEngine,
            getMemoryBuffer: exports.getMemoryBuffer,
            setCellValue: exports.setCellValue,
            getCellValuePtr: exports.getCellValuePtr,
            getCellValueLen: exports.getCellValueLen,
        };

        const zigCel = document.querySelector('zig-cel') as any; // Cast to access custom methods
        if (zigCel && zigCel.setWasmEngine) {
            zigCel.setWasmEngine(engine);
        }

        document.querySelector<HTMLButtonElement>('#calc-btn')!.addEventListener('click', () => {
            const testStr = "=5+7";
            const encoder = new TextEncoder();
            const encoded = encoder.encode(testStr);
            const memArray = new Uint8Array(engine.memory.buffer, engine.getMemoryBuffer(), encoded.length);
            memArray.set(encoded);
            engine.setCellValue(0, 0, encoded.length);
            
            if (zigCel && zigCel.render) zigCel.render();
            
            const len = engine.getCellValueLen(0, 0);
            if (len > 0) {
                const ptr = engine.getCellValuePtr(0, 0);
                const decoder = new TextDecoder();
                const textArray = new Uint8Array(engine.memory.buffer, ptr, len);
                const result = decoder.decode(textArray);
                document.querySelector<HTMLParagraphElement>('#result')!.innerText = `WASM Evaluated (=5+7) in A1: ${result}`;
            }
        });

        console.log("WASM module loaded successfully and injected into component!");
    } catch (e) {
        console.error("Failed to load Wasm", e);
        document.querySelector<HTMLParagraphElement>('#result')!.innerHTML = `<span style="color:red">Error loading WASM: ${e}</span>`;
    }
}

initWasm();
