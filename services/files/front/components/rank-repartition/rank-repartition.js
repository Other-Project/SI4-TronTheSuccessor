import {HTMLComponent} from "/js/component.js";

export class RankRepartition extends HTMLComponent {
    constructor() {
        super("rank-repartition", ["html", "css"]);
    }

    static get observedAttributes() {
        return ["stats"];
    }

    onSetupCompleted = () => {
        this.rankRepartition = this.shadowRoot.getElementById("rank-repartition");
        this.descriptionElement = this.shadowRoot.getElementById("rank-distribution-description");
        this.hoverInfo = this.shadowRoot.getElementById("hover-info");
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "stats") this.stats = JSON.parse(newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.rankRepartition || !this.stats) return;
        this.playerRank = this.stats.rank;
        //TODO: Fetch the rank repartition data from the server

        this.rankRepartitionData = {
            "Line III": 1000,
            "Line II": 700,
            "Line I": 400,
            "Triangle III": 1400,
            "Triangle II": 1100,
            "Triangle I": 500,
            "Square III": 1100,
            "Square II": 700,
            "Square I": 500,
            "Pentagon III": 700,
            "Pentagon II": 400,
            "Pentagon I": 300,
            "Hexagon": 100,
        };
        this.#createRankRepartitionHistogram();
    }

    #createRankRepartitionHistogram(containerWidth = 400, containerHeight = 300, maxGap = 10, maxBarWidth = 30) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${containerWidth} ${containerHeight}`);

        const totalPlayers = Object.values(this.rankRepartitionData).reduce((a, b) => a + b, 0);
        this.descriptionElement.textContent = `Total Players: ${totalPlayers}`;

        const ranks = Object.keys(this.rankRepartitionData);
        const maxValue = Math.max(...Object.values(this.rankRepartitionData));

        const barGroup = document.createElementNS(svgNS, "g");

        const barWidth = Math.min(maxBarWidth, (containerWidth / ranks.length) * 0.6);
        const gap = Math.min(maxGap, (containerWidth / ranks.length) * 0.4);
        const totalWidth = ranks.length * (barWidth + gap) - gap;
        const startX = (containerWidth - totalWidth) / 2;

        ranks.forEach((rank, index) => {
            const value = this.rankRepartitionData[rank];
            const barHeight = (value / maxValue) * 180;
            const x = startX + index * (barWidth + gap);
            const percentage = ((value / totalPlayers) * 100).toFixed(2);

            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", 230 - barHeight);
            rect.setAttribute("width", barWidth);
            rect.setAttribute("height", barHeight);
            rect.setAttribute("fill", "white");
            rect.setAttribute("class", "bar");

            rect.setAttribute("data-rank", rank);
            rect.setAttribute("data-value", value);
            rect.setAttribute("data-percentage", percentage);

            if (rank === this.playerRank)
                rect.setAttribute("fill", "rgb(128, 0, 128)");

            rect.addEventListener("mouseover", () => this.hoverInfo.innerText = `${rank}: ${value} players (${percentage}%)`);
            rect.addEventListener("mouseout", () => this.hoverInfo.innerText = "");

            barGroup.appendChild(rect);

            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", x + barWidth / 2);
            text.setAttribute("y", 250);
            text.setAttribute("transform", `rotate(-45 ${x + barWidth / 2} 250)`);
            text.setAttribute("text-anchor", "end");
            text.setAttribute("font-size", "10");
            text.setAttribute("fill", "white");
            text.textContent = rank;

            barGroup.appendChild(text);
        });

        svg.appendChild(barGroup);
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", "Rank Distribution Histogram");

        this.rankRepartition.innerHTML = "";
        this.rankRepartition.appendChild(svg);
    }
}
