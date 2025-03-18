import {HTMLComponent} from "/js/component.js";

export class ProfileRank extends HTMLComponent {
    static get observedAttributes() {
        return ["rank", "points"];
    }

    constructor() {
        super("profile-rank", ["html", "css"]);
    }

    rankToVertices = {
        "Line": 2,
        "Triangle": 3,
        "Square": 4,
        "Pentagon": 5,
        "Hexagon": 6,
    };

    onSetupCompleted = () => {
        this.rankIcon = this.shadowRoot.getElementById("rank-icon");
        this.rankPoints = this.shadowRoot.getElementById("rank-points");
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    onVisible = () => this.#refresh();

    #refresh() {
        if (!this.rankIcon) return;
        const rankBase = this.rank.replace(/\s*\d+|\s*I{1,3}/g, ''); // Remove numbers and Roman numerals
        this.rankPoints.textContent = this.rank + " ( " + this.points + " TP )";
        this.#createPolygonSVG(this.rankToVertices[rankBase]);
    }

    #createPolygonSVG(vertices) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 100 85");
        svg.setAttribute("fill", "none");

        const polygon = document.createElementNS(svgNS, "polygon");
        polygon.setAttribute("points", this.#calculatePolygonPoints(vertices));
        polygon.setAttribute("stroke", "white");
        polygon.setAttribute("stroke-width", "2");
        polygon.setAttribute("fill", "none");

        svg.appendChild(polygon);
        this.rankIcon.innerHTML = '';
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
}
