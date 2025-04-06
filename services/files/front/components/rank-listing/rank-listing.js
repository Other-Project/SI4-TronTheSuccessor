import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";

export class RankListing extends HTMLComponent {
    constructor() {
        super("rank-listing", ["html", "css"]);
    }

    static get observedAttributes() {
        return ["rank-listing"];
    }

    onSetupCompleted = () => {
        this.topList = this.shadowRoot.getElementById("top-list");
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "rank-listing") this.stats = JSON.parse(newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.topList || !this.stats) return;
        this.topPlayers = this.stats;

        const headerRow = this.topList.querySelector(".header");
        this.topList.innerHTML = "";
        this.topList.appendChild(headerRow);

        this.topPlayers.forEach((player) => {
            const playerRow = document.createElement("div");
            playerRow.classList.add("grid-row");

            const playerIdCell = document.createElement("div");
            playerIdCell.classList.add("grid-cell");
            playerIdCell.classList.add("player-id");
            playerIdCell.textContent = player.playerId;
            playerIdCell.addEventListener("click", () => changePage(`/profile/${player.playerId}`));

            const rankCell = document.createElement("div");
            rankCell.classList.add("grid-cell");
            rankCell.textContent = player.rank;

            const winrateCell = document.createElement("div");
            winrateCell.classList.add("grid-cell");
            winrateCell.textContent = Math.round(player.tronPoints).toString();

            playerRow.appendChild(playerIdCell);
            playerRow.appendChild(rankCell);
            playerRow.appendChild(winrateCell);

            this.topList.appendChild(playerRow);
        });
    }
}
