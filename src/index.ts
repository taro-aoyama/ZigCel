import { ZigCelElement } from './ZigCelElement';
import type { WasmEngine } from './ZigCelElement';

// Export the Web Component class in case someone wants to extend it
export { ZigCelElement };

/**
 * Helper function to fetch and initialize the ZigCel WASM module.
 * @param wasmUrl The path/URL to the zigcel.wasm file.
 * @returns A Promise that resolves to the initialized WasmEngine.
 */
export async function initZigCelWasm(wasmUrl: string = '/zigcel.wasm'): Promise<WasmEngine> {
    const response = await fetch(wasmUrl + '?t=' + Date.now());
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.instantiate(buffer, {
        env: {}
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
    
    return engine;
}

/**
 * Utility to easily mount and initialize a ZigCel element with the WASM engine.
 * @param element The DOM element (typically <zig-cel>).
 * @param wasmUrl The path/URL to the zigcel.wasm file.
 */
export async function mountZigCel(element: HTMLElement, wasmUrl: string = '/zigcel.wasm'): Promise<void> {
    const engine = await initZigCelWasm(wasmUrl);
    const zigCel = element as any;
    if (zigCel && typeof zigCel.setWasmEngine === 'function') {
        zigCel.setWasmEngine(engine);
    } else {
        console.error("Target element does not appear to be a <zig-cel> component.");
    }
}
