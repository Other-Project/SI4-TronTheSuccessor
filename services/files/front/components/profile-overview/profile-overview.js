import {HTMLComponent} from "/js/component.js";
import {getCookie} from "../../js/login-manager.js";

export class ProfileOverview extends HTMLComponent {

    constructor() {
        super("profile-overview", ["html", "css"]);
    }

    onSetupCompleted = async () => {
        this.rankIcon = this.shadowRoot.querySelector('app-profile-rank [slot="rank-icon"]');
        this.rank = this.shadowRoot.querySelector("app-profile-rank [slot=\"rank\"]");

        const userName = location.search.split("=")[1];
        const rank = await fetch(`/api/game/elo/${userName}`, {
            headers: {
                "Authorization": `Bearer ${getCookie("accessToken")}`
            }
        }).then(response => response.text());
        this.rank.textContent = rank;
        this.#createPolygonSVG(rank);
    };

    #createPolygonSVG(vertices) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "24");
        svg.setAttribute("height", "24");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("fill", "none");

        const polygon = document.createElementNS(svgNS, "polygon");
        polygon.setAttribute("points", this.#calculatePolygonPoints(vertices));
        polygon.setAttribute("stroke", "white");
        polygon.setAttribute("stroke-width", "2");
        polygon.setAttribute("fill", "none");

        svg.appendChild(polygon);
        this.rankIcon.appendChild(svg);
    }

    #calculatePolygonPoints(vertices) {
        if (vertices < 1) return "";

        const angleStep = (2 * Math.PI) / vertices;
        const radius = 40;
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