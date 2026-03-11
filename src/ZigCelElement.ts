// Web Component <zig-cel>
export class ZigCelElement extends HTMLElement {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private resizeObserver: ResizeObserver;

    // Scroll Offsets
    private scrollX: number = 0;
    private scrollY: number = 0;
    private scrollTicking: boolean = false;

    // Selection State
    private selectedCol: number | null = null;
    private selectedRow: number | null = null;

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

        // Setup Wheel event listener for scrolling
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        // Setup Mouse click listener for cell selection
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
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

    private handleWheel(e: WheelEvent) {
        // Prevent default browser scrolling when inside the spreadsheet
        e.preventDefault(); 

        // Update offsets (round to integer to prevent subpixel rendering artifacts)
        this.scrollX += Math.round(e.deltaX);
        this.scrollY += Math.round(e.deltaY);

        // Prevent negative scrolling (scrolling past top/left)
        if (this.scrollX < 0) this.scrollX = 0;
        if (this.scrollY < 0) this.scrollY = 0;

        // Use requestAnimationFrame to throttle re-rendering
        if (!this.scrollTicking) {
            window.requestAnimationFrame(() => {
                this.render();
                this.scrollTicking = false;
            });
            this.scrollTicking = true;
        }
    }

    private handleMouseDown(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate logical CSS coordinates relative to the canvas
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Constants (should match rendering logic)
        const headerWidth = 50;
        const headerHeight = 24;
        const cellWidth = 100;
        const cellHeight = 24;

        // Ignore clicks on headers for now
        if (x < headerWidth || y < headerHeight) {
            return;
        }

        // Calculate clicked cell indices considering current scroll offset
        const col = Math.floor((x - headerWidth + this.scrollX) / cellWidth);
        const row = Math.floor((y - headerHeight + this.scrollY) / cellHeight);

        this.selectedCol = col;
        this.selectedRow = row;

        this.render(); // Re-render to show selection
    }

    private handleResize(width: number, height: number) {
        if (width === 0 || height === 0) return;

        // Handle Device Pixel Ratio for crisp rendering on Retina displays
        const dpr = window.devicePixelRatio || 1;
        
        // The actual size of the canvas in memory (scaled by DPR)
        this.canvas.width = Math.floor(width * dpr);
        this.canvas.height = Math.floor(height * dpr);
        
        // CSS display size
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        // Normalize coordinate system to use CSS pixels
        this.ctx.scale(dpr, dpr);

        this.render();
    }

    private renderSelection(width: number, height: number) {
        if (this.selectedCol === null || this.selectedRow === null) return;

        const headerWidth = 50;
        const headerHeight = 24;
        const cellWidth = 100;
        const cellHeight = 24;

        // Calculate absolute pixel position of the selected cell on canvas
        const x = Math.floor(this.selectedCol * cellWidth - this.scrollX + headerWidth);
        const y = Math.floor(this.selectedRow * cellHeight - this.scrollY + headerHeight);

        // Don't draw if the cell has completely scrolled out of the visible viewing area (left or above headers)
        if (x + cellWidth <= headerWidth || y + cellHeight <= headerHeight) return;

        this.ctx.save();
        this.ctx.beginPath();
        
        // Clip area strictly to the main grid space (avoid drawing over headers)
        this.ctx.rect(headerWidth, headerHeight, width - headerWidth, height - headerHeight);
        this.ctx.clip();

        // Draw selection border (Google Sheets Blue)
        this.ctx.strokeStyle = '#1a73e8';
        this.ctx.lineWidth = 2;
        // Stroke rectangle (draw slightly inside the cell so border is fully visible)
        this.ctx.strokeRect(x + 1, y + 1, cellWidth - 1, cellHeight - 1);
        
        // Fill semi-transparent blue background
        this.ctx.fillStyle = 'rgba(26, 115, 232, 0.1)';
        this.ctx.fillRect(x + 1, y + 1, cellWidth - 1, cellHeight - 1);

        this.ctx.restore();
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
        const headerWidth = 50;
        const headerHeight = 24;
        const gridColor = '#e2e8f0'; // Light gray

        this.ctx.beginPath();
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;

        // Offset to start drawing
        const offsetX = -(this.scrollX % cellWidth) + headerWidth;
        const offsetY = -(this.scrollY % cellHeight) + headerHeight;

        // Draw vertical lines
        for (let x = offsetX; x <= width; x += cellWidth) {
            if (x < headerWidth) continue; // Don't draw over row headers
            const pixelX = Math.floor(x) + 0.5;
            this.ctx.moveTo(pixelX, headerHeight);
            this.ctx.lineTo(pixelX, height);
        }

        // Draw horizontal lines
        for (let y = offsetY; y <= height; y += cellHeight) {
            if (y < headerHeight) continue; // Don't draw over col headers
            const pixelY = Math.floor(y) + 0.5;
            this.ctx.moveTo(headerWidth, pixelY);
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

        // Clear header areas before drawing to prevent text overlapping during scroll
        this.ctx.clearRect(0, 0, width, headerHeight); // Top header
        this.ctx.clearRect(0, 0, headerWidth, height); // Left header

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

        // -------------------------
        // Draw Column Headers (Top)
        // -------------------------
        this.ctx.save();
        this.ctx.beginPath();
        // Clip area strictly to the top header space
        this.ctx.rect(headerWidth, 0, width - headerWidth, headerHeight);
        this.ctx.clip();
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;

        let colIndex = Math.floor(this.scrollX / cellWidth);
        const offsetX = -(this.scrollX % cellWidth) + headerWidth;

        for (let x = offsetX; x <= width; x += cellWidth) {
            // Draw separator line
            const pixelX = Math.floor(x) + 0.5;
            this.ctx.moveTo(pixelX, 0);
            this.ctx.lineTo(pixelX, headerHeight);

            // Draw text
            if (x >= headerWidth - cellWidth) {
                const label = this.getColumnLabel(colIndex);
                this.ctx.fillText(label, x + cellWidth / 2, headerHeight / 2);
            }
            colIndex++;
        }
        this.ctx.stroke();
        this.ctx.restore();

        // -------------------------
        // Draw Row Headers (Left)
        // -------------------------
        this.ctx.save();
        this.ctx.beginPath();
        // Clip area strictly to the left header space
        this.ctx.rect(0, headerHeight, headerWidth, height - headerHeight);
        this.ctx.clip();

        this.ctx.beginPath();
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;

        let rowIndex = Math.floor(this.scrollY / cellHeight) + 1;
        const offsetY = -(this.scrollY % cellHeight) + headerHeight;

        for (let y = offsetY; y <= height; y += cellHeight) {
            // Draw separator line
            const pixelY = Math.floor(y) + 0.5;
            this.ctx.moveTo(0, pixelY);
            this.ctx.lineTo(headerWidth, pixelY);

            // Draw text
            if (y >= headerHeight - cellHeight) {
                this.ctx.fillText(rowIndex.toString(), headerWidth / 2, y + cellHeight / 2);
            }
            rowIndex++;
        }
        this.ctx.stroke();
        this.ctx.restore();

        // -------------------------
        // Draw Borders
        // -------------------------
        this.ctx.beginPath();
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;
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
        this.renderSelection(cssWidth, cssHeight);
        this.renderHeaders(cssWidth, cssHeight);
    }
}

// Register the custom element
customElements.define('zig-cel', ZigCelElement);
