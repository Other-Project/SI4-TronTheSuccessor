import {HTMLComponent} from "/js/component.js";
import {getCookie} from "../../js/login-manager.js";
import {parseJwt} from "../../components/login/login.js";

export class ProfileOverview extends HTMLComponent {
    rankToVertices = {
        "Line": 2,
        "Triangle": 3,
        "Square": 4,
        "Pentagon": 5,
        "Hexagon": 6,
    };

    constructor() {
        super("profile-overview", ["html", "css"]);
    }

    onSetupCompleted = async () => {
        const userName = location.search.split("=")[1];
        const token = getCookie("accessToken");
        let jwt;
        if (token !== "") jwt = parseJwt(token);
        if (jwt && jwt.username === userName)
            this.shadowRoot.querySelectorAll('app-button').forEach(button => button.classList.toggle("hidden"));

        this.rankIcon = this.shadowRoot.querySelector('app-profile-rank [slot="rank-icon"]');
        this.rank = this.shadowRoot.querySelector('app-profile-rank [slot="rank"]');
        this.profileStats = this.shadowRoot.getElementById("profiles-stats");
        this.profilePfp = this.shadowRoot.getElementById("profile-pfp");

        this.shadowRoot.querySelector('[slot="name"]').textContent = userName;

        const stats = await fetch(`/api/game/stats/${userName}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(response => response.json());
        if (stats) this.#updateProfileStats(stats);
    };

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

    #updateProfileStats(stats) {
        const rankBase = stats.rank.replace(/\s*\d+|\s*I{1,3}/g, ''); // Remove numbers and Roman numerals
        this.rank.textContent = `${stats.rank} (${stats.eloInRank} TP)`;
        this.#createPolygonSVG(this.rankToVertices[rankBase]);
        this.profileStats.setAttribute("data-games", stats.games);
        this.profileStats.setAttribute("data-time", Math.round(stats.timePlayed / 60));
        this.profileStats.setAttribute("data-streak", stats.winStreak);
        this.profileStats.setAttribute("data-winrate", Math.round((stats.wins * 100 / (stats.games - stats.draws))));
    }
}
