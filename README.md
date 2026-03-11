# ZigCel

<div align="center">
  <img src="https://via.placeholder.com/800x400?text=ZigCel+Spreadsheet+Engine" alt="ZigCel Banner" width="100%">
  <p><strong>A blazingly fast, framework-agnostic spreadsheet engine built with Zig (WASM) & Canvas API.</strong></p>
</div>

## 🚀 Overview

**ZigCel** is a lightweight, high-performance spreadsheet component designed to work seamlessly across any web framework (React, Vue, Svelte, or even plain HTML/Rails ERB).
By leveraging the power of **Zig** compiled to WebAssembly (WASM) for the core computation engine, and HTML5 Canvas for rendering, ZigCel handles massive amounts of cell data and complex formulas with near-native speed.

### Why ZigCel?
- **Framework Agnostic**: Delivered as a standard Web Component (`<zig-cel>`). Works anywhere.
- **Blazing Fast**: Core logic is written in Zig and compiled to WASM. Memory management is predictable and hyper-optimized.
- **Canvas Rendering**: No DOM bloat. Renders thousands of cells smoothly like Google Sheets.
- **Developer Friendly**: Built for easy integration into existing enterprise applications or personal projects.

## 📦 Architecture

ZigCel consists of three main layers:

1. **Core Engine (Zig/WASM)**
   - Manages spreadsheet data structures (cells, rows, columns).
   - Handles the dependency graph and formula recalculation.
   - Zero JavaScript overhead for mathematical operations.
2. **Rendering Engine (TypeScript + Canvas API)**
   - Translates WASM data into highly optimized Canvas draw calls.
   - Manages viewport rendering (scroll, zoom, resize) without creating thousands of DOM nodes.
3. **Binding Layer (Web Components)**
   - Provides the `<zig-cel></zig-cel>` custom element interface.

## 🛠️ Quick Start (Development)

We use Docker Compose to ensure a consistent development environment across all machines without worrying about Node.js/Zig versions.

### Prerequisites
- Docker & Docker Compose
- (For Host OS) macOS / Linux / Windows WSL2

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ZigCel.git
cd ZigCel

# 2. Start the development environment
docker-compose up -d

# 3. Access the dev server
# Open http://localhost:5173 in your browser
```

Inside the Docker container, Vite will automatically build the Zig code to WASM and serve the frontend with Hot Module Replacement (HMR).

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
