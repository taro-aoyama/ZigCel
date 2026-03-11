import './style.css'
// Initialize web component
import './ZigCelElement';

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
        // Fetch and instantiate the WASM module
        const response = await fetch('/zigcel.wasm');
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.instantiate(buffer, {
            env: {
                // If Zig requires imported functions (e.g. for memory/logging), define them here.
                // Our simple add function doesn't need any.
            }
        });

        // Get the exported `add` function from the WASM module
        // We know from Zig that it has the signature (i32, i32) -> i32
        const add = module.instance.exports.add as (a: number, b: number) => number;

        document.querySelector<HTMLButtonElement>('#calc-btn')!.addEventListener('click', () => {
            const result = add(5, 7);
            document.querySelector<HTMLParagraphElement>('#result')!.innerText = `Result from WASM (5 + 7): ${result}`;
        });

        console.log("WASM module loaded successfully!");
    } catch (e) {
        console.error("Failed to load Wasm", e);
        document.querySelector<HTMLParagraphElement>('#result')!.innerHTML = `<span style="color:red">Error loading WASM: ${e}</span>`;
    }
}

initWasm();
