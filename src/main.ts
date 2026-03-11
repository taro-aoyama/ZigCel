import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>ZigCel - WASM Spreadsheet Prototype</h1>
    <div class="card">
      <button id="calc-btn" type="button">Run Zig Calculation (5 + 7)</button>
    </div>
    <p id="result" class="read-the-docs">
      Result will appear here.
    </p>
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
