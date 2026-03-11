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
        // Initial render triggers after first resize observer callback
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

        this.render();
    }

    private renderGrid(width: number, height: number) {
        // Clear previous drawing
        this.ctx.clearRect(0, 0, width, height);

        // Fill background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, width, height);

        // Grid settings
        const cellWidth = 100;
        const cellHeight = 24;
        const gridColor = '#e2e8f0'; // Light gray

        this.ctx.beginPath();
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= width; x += cellWidth) {
            // align to pixel exactly to avoid blur
            const pixelX = Math.floor(x) + 0.5;
            this.ctx.moveTo(pixelX, 0);
            this.ctx.lineTo(pixelX, height);
        }

        // Draw horizontal lines
        for (let y = 0; y <= height; y += cellHeight) {
            const pixelY = Math.floor(y) + 0.5;
            this.ctx.moveTo(0, pixelY);
            this.ctx.lineTo(width, pixelY);
        }

        this.ctx.stroke();
    }

    private getColumnLabel(index: number): string {
        let label = '';
        let temp = index;
        while (temp >= 0) {
            label = String.fromCharCode((temp % 26) + 65) + label;
            temp = Math.floor(temp / 26) - 1;
        }
        return label;
    }

    private renderHeaders(width: number, height: number) {
        const cellWidth = 100;
        const cellHeight = 24;
        const headerWidth = 50;  // Width of the row number column
        const headerHeight = 24; // Height of the column letter row
        const headerBgColor = '#f8fafc';
        const headerTextColor = '#64748b';
        const gridColor = '#cbd5e1';

        // Draw header backgrounds
        this.ctx.fillStyle = headerBgColor;
        this.ctx.fillRect(0, 0, width, headerHeight); // Top header (letters)
        this.ctx.fillRect(0, 0, headerWidth, height); // Left header (numbers)

        // Draw top-left intersection box
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.fillRect(0, 0, headerWidth, headerHeight);

        this.ctx.beginPath();
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;

        // Text settings
        this.ctx.fillStyle = headerTextColor;
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Draw Column Headers (A, B, C...)
        let colIndex = 0;
        for (let x = headerWidth; x < width; x += cellWidth) {
            // Draw separator line
            const pixelX = Math.floor(x) + 0.5;
            this.ctx.moveTo(pixelX, 0);
            this.ctx.lineTo(pixelX, headerHeight);

            // Draw text
            const label = this.getColumnLabel(colIndex);
            this.ctx.fillText(label, x + cellWidth / 2, headerHeight / 2);
            colIndex++;
        }

        // Draw Row Headers (1, 2, 3...)
        let rowIndex = 1;
        for (let y = headerHeight; y < height; y += cellHeight) {
            // Draw separator line
            const pixelY = Math.floor(y) + 0.5;
            this.ctx.moveTo(0, pixelY);
            this.ctx.lineTo(headerWidth, pixelY);

            // Draw text
            this.ctx.fillText(rowIndex.toString(), headerWidth / 2, y + cellHeight / 2);
            rowIndex++;
        }

        // Draw bottom border for top header
        this.ctx.moveTo(0, Math.floor(headerHeight) + 0.5);
        this.ctx.lineTo(width, Math.floor(headerHeight) + 0.5);

        // Draw right border for left header
        this.ctx.moveTo(Math.floor(headerWidth) + 0.5, 0);
        this.ctx.lineTo(Math.floor(headerWidth) + 0.5, height);

        this.ctx.stroke();
    }

    private render() {
        const cssWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const cssHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        this.renderGrid(cssWidth, cssHeight);
        this.renderHeaders(cssWidth, cssHeight);
    }
}

// Register the custom element
customElements.define('zig-cel', ZigCelElement);
