// Web Component <zig-cel>
export class ZigCelElement extends HTMLElement {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private resizeObserver: ResizeObserver;

    constructor() {
        super();
        
        // Attach Shadow DOM for encapsulation
        this.attachShadow({ mode: 'open' });

        // Build internal DOM
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';

        this.shadowRoot?.appendChild(this.canvas);

        // Get 2D Context
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Failed to get 2D render context");
        }
        this.ctx = ctx;

        // Setup ResizeObserver to handle container size changes
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === this) {
                    this.handleResize(entry.contentRect.width, entry.contentRect.height);
                }
            }
        });
    }

    connectedCallback() {
        // Called when the element is inserted into a document
        this.resizeObserver.observe(this);
    }

    disconnectedCallback() {
        // Called when the element is removed from a document
        this.resizeObserver.disconnect();
    }

    private handleResize(width: number, height: number) {
        if (width === 0 || height === 0) return;

        // Handle Device Pixel Ratio for crisp rendering on Retina displays
        const dpr = window.devicePixelRatio || 1;
        
        // The actual size of the canvas in memory (scaled by DPR)
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        // CSS display size
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        // Normalize coordinate system to use CSS pixels
        this.ctx.scale(dpr, dpr);

        this.renderDummy();
    }

    private renderDummy() {
        // Clear previous drawing
        const cssWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const cssHeight = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.clearRect(0, 0, cssWidth, cssHeight);

        // Draw a placeholder background
        this.ctx.fillStyle = '#f3f4f6';
        this.ctx.fillRect(0, 0, cssWidth, cssHeight);

        // Draw a box in the center
        const boxW = 200;
        const boxH = 100;
        const boxX = (cssWidth - boxW) / 2;
        const boxY = (cssHeight - boxH) / 2;

        this.ctx.fillStyle = '#646cff';
        this.ctx.fillRect(boxX, boxY, boxW, boxH);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`ZigCel API (${Math.round(cssWidth)}x${Math.round(cssHeight)})`, boxX + boxW / 2, boxY + boxH / 2);
    }
}

// Register the custom element
customElements.define('zig-cel', ZigCelElement);
