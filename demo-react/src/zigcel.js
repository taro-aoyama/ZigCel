class C extends HTMLElement {
  canvas;
  ctx;
  resizeObserver;
  // Scroll Offsets
  scrollX = 0;
  scrollY = 0;
  scrollTicking = !1;
  // Selection and Editing State
  selectedCol = null;
  selectedRow = null;
  editingCol = null;
  editingRow = null;
  isEditing = !1;
  // Elements
  inputField;
  // WebAssembly Engine Reference
  wasmEngine = null;
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this.style.position = "relative", this.style.display = "block", this.style.width = "100%", this.style.height = "100%", this.canvas = document.createElement("canvas"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.display = "block", this.inputField = document.createElement("input"), this.inputField.type = "text", this.inputField.style.position = "absolute", this.inputField.style.display = "none", this.inputField.style.boxSizing = "border-box", this.inputField.style.border = "2px solid #1a73e8", this.inputField.style.outline = "none", this.inputField.style.padding = "0 4px", this.inputField.style.font = "13px sans-serif", this.inputField.style.margin = "0", this.inputField.style.backgroundColor = "#fff", this.inputField.style.zIndex = "100", this.inputField.addEventListener("blur", this.finishEditing.bind(this)), this.inputField.addEventListener("keydown", (e) => {
      e.key === "Enter" ? this.inputField.blur() : e.key === "Escape" && this.cancelEditing();
    }), this.shadowRoot?.appendChild(this.canvas), this.shadowRoot?.appendChild(this.inputField);
    const t = this.canvas.getContext("2d");
    if (!t)
      throw new Error("Failed to get 2D render context");
    this.ctx = t, this.resizeObserver = new ResizeObserver((e) => {
      for (const i of e)
        i.target === this && this.handleResize(i.contentRect.width, i.contentRect.height);
    }), this.canvas.addEventListener("wheel", this.handleWheel.bind(this), { passive: !1 }), this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this)), this.canvas.addEventListener("dblclick", this.handleDoubleClick.bind(this));
  }
  setWasmEngine(t) {
    this.wasmEngine = t, this.wasmEngine.initEngine(), this.render();
  }
  connectedCallback() {
    this.resizeObserver.observe(this);
  }
  disconnectedCallback() {
    this.resizeObserver.disconnect();
  }
  handleWheel(t) {
    t.preventDefault(), this.isEditing && this.inputField.blur(), this.scrollX += Math.round(t.deltaX), this.scrollY += Math.round(t.deltaY), this.scrollX < 0 && (this.scrollX = 0), this.scrollY < 0 && (this.scrollY = 0), this.scrollTicking || (window.requestAnimationFrame(() => {
      this.render(), this.scrollTicking = !1;
    }), this.scrollTicking = !0);
  }
  handleMouseDown(t) {
    const e = this.canvas.getBoundingClientRect(), i = t.clientX - e.left, s = t.clientY - e.top, n = 50, h = 24, c = 100, r = 24;
    if (i < n || s < h)
      return;
    const a = Math.floor((i - n + this.scrollX) / c), d = Math.floor((s - h + this.scrollY) / r);
    this.selectedCol = a, this.selectedRow = d, this.render();
  }
  handleDoubleClick() {
    this.selectedCol === null || this.selectedRow === null || this.startEditing(this.selectedCol, this.selectedRow);
  }
  startEditing(t, e) {
    this.isEditing = !0, this.editingCol = t, this.editingRow = e;
    const i = 50, s = 24, n = 100, h = 24, c = t * n - this.scrollX + i, r = e * h - this.scrollY + s;
    this.inputField.style.left = `${c}px`, this.inputField.style.top = `${r}px`, this.inputField.style.width = `${n}px`, this.inputField.style.height = `${h}px`, this.inputField.style.display = "block";
    let a = "";
    if (this.wasmEngine) {
      const d = this.wasmEngine.getCellValueLen(t, e);
      if (d > 0) {
        const x = this.wasmEngine.getCellValuePtr(t, e), f = new TextDecoder(), g = new Uint8Array(this.wasmEngine.memory.buffer, x, d);
        a = f.decode(g);
      }
    }
    this.inputField.value = a, setTimeout(() => {
      this.inputField.focus(), this.inputField.select();
    }, 0);
  }
  finishEditing() {
    if (!this.isEditing) return;
    const t = this.inputField.value;
    if (this.wasmEngine && this.editingCol !== null && this.editingRow !== null) {
      const i = new TextEncoder().encode(t), s = this.wasmEngine.getMemoryBuffer();
      i.length > 0 && new Uint8Array(this.wasmEngine.memory.buffer, s, i.length).set(i), this.wasmEngine.setCellValue(this.editingCol, this.editingRow, i.length);
    }
    this.isEditing = !1, this.editingCol = null, this.editingRow = null, this.inputField.style.display = "none", this.render();
  }
  cancelEditing() {
    this.isEditing && (this.isEditing = !1, this.editingCol = null, this.editingRow = null, this.inputField.style.display = "none", this.render());
  }
  handleResize(t, e) {
    if (t === 0 || e === 0) return;
    const i = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(t * i), this.canvas.height = Math.floor(e * i), this.canvas.style.width = `${t}px`, this.canvas.style.height = `${e}px`, this.ctx.scale(i, i), this.render();
  }
  renderSelection(t, e) {
    if (this.selectedCol === null || this.selectedRow === null) return;
    const i = 50, s = 24, n = 100, h = 24, c = Math.floor(this.selectedCol * n - this.scrollX + i), r = Math.floor(this.selectedRow * h - this.scrollY + s);
    c + n <= i || r + h <= s || (this.ctx.save(), this.ctx.beginPath(), this.ctx.rect(i, s, t - i, e - s), this.ctx.clip(), this.ctx.strokeStyle = "#1a73e8", this.ctx.lineWidth = 2, this.ctx.strokeRect(c + 1, r + 1, n - 1, h - 1), this.ctx.fillStyle = "rgba(26, 115, 232, 0.1)", this.ctx.fillRect(c + 1, r + 1, n - 1, h - 1), this.ctx.restore());
  }
  renderGrid(t, e) {
    this.ctx.clearRect(0, 0, t, e), this.ctx.fillStyle = "#ffffff", this.ctx.fillRect(0, 0, t, e);
    const i = 100, s = 24, n = 50, h = 24, c = "#e2e8f0";
    this.ctx.beginPath(), this.ctx.strokeStyle = c, this.ctx.lineWidth = 1;
    const r = -(this.scrollX % i) + n, a = -(this.scrollY % s) + h;
    for (let l = r; l <= t; l += i) {
      if (l < n) continue;
      const o = Math.floor(l) + 0.5;
      this.ctx.moveTo(o, h), this.ctx.lineTo(o, e);
    }
    for (let l = a; l <= e; l += s) {
      if (l < h) continue;
      const o = Math.floor(l) + 0.5;
      this.ctx.moveTo(n, o), this.ctx.lineTo(t, o);
    }
    this.ctx.stroke(), this.ctx.save(), this.ctx.beginPath(), this.ctx.rect(n, h, t - n, e - h), this.ctx.clip(), this.ctx.fillStyle = "#000000", this.ctx.font = "13px sans-serif", this.ctx.textAlign = "left", this.ctx.textBaseline = "middle";
    const d = Math.max(0, Math.floor(this.scrollX / i)), x = Math.floor((this.scrollX + t - n) / i) + 1, f = Math.max(0, Math.floor(this.scrollY / s)), g = Math.floor((this.scrollY + e - h) / s) + 1;
    for (let l = f; l <= g; l++)
      for (let o = d; o <= x; o++) {
        if (!this.wasmEngine) continue;
        const p = this.wasmEngine.getCellValueLen(o, l);
        if (p > 0) {
          const w = this.wasmEngine.getCellValuePtr(o, l), b = new TextDecoder(), v = new Uint8Array(this.wasmEngine.memory.buffer, w, p), E = b.decode(v), y = Math.floor(o * i - this.scrollX + n), m = Math.floor(l * s - this.scrollY + h);
          this.ctx.save(), this.ctx.beginPath(), this.ctx.rect(y + 1, m + 1, i - 2, s - 2), this.ctx.clip(), this.ctx.fillText(E, y + 4, m + s / 2), this.ctx.restore();
        }
      }
    this.ctx.restore();
  }
  getColumnLabel(t) {
    let e = "", i = t;
    for (; i >= 0; )
      e = String.fromCharCode(i % 26 + 65) + e, i = Math.floor(i / 26) - 1;
    return e;
  }
  renderHeaders(t, e) {
    const c = "#f8fafc", r = "#64748b", a = "#cbd5e1";
    this.ctx.clearRect(0, 0, t, 24), this.ctx.clearRect(0, 0, 50, e), this.ctx.fillStyle = c, this.ctx.fillRect(0, 0, t, 24), this.ctx.fillRect(0, 0, 50, e), this.ctx.fillStyle = "#e2e8f0", this.ctx.fillRect(0, 0, 50, 24), this.ctx.beginPath(), this.ctx.strokeStyle = a, this.ctx.lineWidth = 1, this.ctx.fillStyle = r, this.ctx.font = "12px sans-serif", this.ctx.textAlign = "center", this.ctx.textBaseline = "middle", this.ctx.save(), this.ctx.beginPath(), this.ctx.rect(50, 0, t - 50, 24), this.ctx.clip(), this.ctx.beginPath(), this.ctx.strokeStyle = a, this.ctx.lineWidth = 1;
    let d = Math.floor(this.scrollX / 100);
    const x = -(this.scrollX % 100) + 50;
    for (let l = x; l <= t; l += 100) {
      const o = Math.floor(l) + 0.5;
      if (this.ctx.moveTo(o, 0), this.ctx.lineTo(o, 24), l >= -50) {
        const p = this.getColumnLabel(d);
        this.ctx.fillText(p, l + 100 / 2, 24 / 2);
      }
      d++;
    }
    this.ctx.stroke(), this.ctx.restore(), this.ctx.save(), this.ctx.beginPath(), this.ctx.rect(0, 24, 50, e - 24), this.ctx.clip(), this.ctx.beginPath(), this.ctx.strokeStyle = a, this.ctx.lineWidth = 1;
    let f = Math.floor(this.scrollY / 24) + 1;
    const g = -(this.scrollY % 24) + 24;
    for (let l = g; l <= e; l += 24) {
      const o = Math.floor(l) + 0.5;
      this.ctx.moveTo(0, o), this.ctx.lineTo(50, o), l >= 0 && this.ctx.fillText(f.toString(), 50 / 2, l + 24 / 2), f++;
    }
    this.ctx.stroke(), this.ctx.restore(), this.ctx.beginPath(), this.ctx.strokeStyle = a, this.ctx.lineWidth = 1, this.ctx.moveTo(0, Math.floor(24) + 0.5), this.ctx.lineTo(t, Math.floor(24) + 0.5), this.ctx.moveTo(Math.floor(50) + 0.5, 0), this.ctx.lineTo(Math.floor(50) + 0.5, e), this.ctx.stroke();
  }
  render() {
    const t = this.canvas.width / (window.devicePixelRatio || 1), e = this.canvas.height / (window.devicePixelRatio || 1);
    this.renderGrid(t, e), this.renderSelection(t, e), this.renderHeaders(t, e);
  }
}
customElements.define("zig-cel", C);
async function W(u = "/zigcel.wasm") {
  const e = await (await fetch(u + "?t=" + Date.now())).arrayBuffer(), s = (await WebAssembly.instantiate(e, {
    env: {}
  })).instance.exports;
  return {
    memory: s.memory,
    initEngine: s.initEngine,
    getMemoryBuffer: s.getMemoryBuffer,
    setCellValue: s.setCellValue,
    getCellValuePtr: s.getCellValuePtr,
    getCellValueLen: s.getCellValueLen
  };
}
async function M(u, t = "/zigcel.wasm") {
  const e = await W(t), i = u;
  i && typeof i.setWasmEngine == "function" ? i.setWasmEngine(e) : console.error("Target element does not appear to be a <zig-cel> component.");
}
export {
  C as ZigCelElement,
  W as initZigCelWasm,
  M as mountZigCel
};
