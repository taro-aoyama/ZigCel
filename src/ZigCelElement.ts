// Web Component <zig-cel>
export class ZigCelElement extends HTMLElement {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

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
    }

    connectedCallback() {
        // Called when the element is inserted into a document
        this.renderDummy();
    }

    private renderDummy() {
        // Just draw a red rectangle to prove Canvas is mounted and working
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(10, 10, 100, 50);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('ZigCel', 60, 35);
    }
}

// Register the custom element
customElements.define('zig-cel', ZigCelElement);
