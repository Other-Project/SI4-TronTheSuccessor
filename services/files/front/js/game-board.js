export class GameBoard extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "open" });
        this.canvas = document.createElement("canvas");
        this.canvas.style.maxWidth = "100%";
        this.canvas.style.maxHeight = "100%";
        this.canvas.width = 1700;
        this.canvas.height = 1000;
        this.ctx = this.canvas.getContext("2d");
        shadow.appendChild(this.canvas);

        this.#draw();
    }

    #draw() {
        this.#drawHaxagons(16, 9, 100);
    }

    #drawHaxagons(xNb, yNb, size) {
        for (let x = 0; x < xNb; x++)
            for (let y = 0; y < yNb; y++)
                this.#drawHexagon(x * size + (y * size / 2) % size + size / 4, y * size * 3 / 4 + size / 4, size);
    }

    #drawHexagon(x, y, size) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + size / 2, y);
        this.ctx.lineTo(x, y + size / 4);
        this.ctx.lineTo(x, y + size * 3 / 4);
        this.ctx.lineTo(x + size / 2, y + size);
        this.ctx.lineTo(x + size, y + size * 3 / 4);
        this.ctx.lineTo(x + size, y + size / 4);
        this.ctx.lineTo(x + size / 2, y);
        this.ctx.stroke();
    }
}
