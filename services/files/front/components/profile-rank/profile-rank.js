import {HTMLComponent} from "/js/component.js";

export class ProfileRank extends HTMLComponent {
    rankToVertices = {
        "Line": 2,
        "Triangle": 3,
        "Square": 4,
        "Pentagon": 5,
        "Hexagon": 6,
    };

    constructor() {
        super("profile-rank", ["html", "css"]);
    }

    static get observedAttributes() {
        return ["rank", "points", "baserank", "height"];
    }

    onSetupCompleted = () => {
        this.rankIcon = this.shadowRoot.getElementById("rank-icon");
        this.rankPoints = this.shadowRoot.getElementById("rank-points");
        this.rankInfo = this.shadowRoot.getElementById("rank-info");
        this.rankPopUp = this.shadowRoot.getElementById("rank-popup");
        this.close = this.shadowRoot.getElementById("close");
        this.rankPopUp.style.display = "none";

        this.rankInfo.addEventListener("click", () => this.rankPopUp.style.display = "block");
        this.shadowRoot.addEventListener("hide-popup", () => this.#close());
        this.close.addEventListener("click", () => this.#close());
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    onVisible = () => this.#refresh();

    #refresh() {
        if (!this.rankIcon) return;
        this.rankPoints.textContent = this.rank + " ( " + Math.round(this.points) + " TP )";
        this.#createPolygonSVG(this.rankToVertices[this.baserank]);
    }

    #createPolygonSVG(vertices) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 100 85");
        svg.setAttribute("fill", "none");
        svg.style.display = "block";
        svg.style.maxHeight = this.height + "px";
        svg.style.width = "100%";

        const polygon = document.createElementNS(svgNS, "polygon");
        polygon.setAttribute("points", this.#calculatePolygonPoints(vertices));
        polygon.setAttribute("stroke", "white");
        polygon.setAttribute("stroke-width", "2");
        polygon.setAttribute("fill", "none");

        svg.appendChild(polygon);
        this.rankIcon.innerHTML = "";
        this.rankIcon.appendChild(svg);
    }

    #calculatePolygonPoints(vertices) {
        if (vertices < 1) return "";

        const angleStep = (2 * Math.PI) / vertices;
        const radius = 48;
        const centerX = 50;
        const centerY = 50;
        let points = "";

        for (let i = 0; i < vertices; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            points += `${x},${y} `;
        }

        return points.trim();
    }

    #close() {
        this.rankPopUp.style.display = "none";
    }
}
