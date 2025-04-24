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
        this.#refresh();
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "rank-listing") this.stats = JSON.parse(newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.topList || !this.stats) return;
        this.topPlayers = this.stats;

        this.topList.innerHTML = "";

        this.topPlayers.forEach((player, index) => {
            const playerRow = document.createElement("div");
            playerRow.classList.add("grid-row");
            playerRow.classList.add(`rank-${index + 1}`);

            const rankMarker = document.createElement("div");
            rankMarker.classList.add("rank-marker");
            rankMarker.textContent = index + 1;
            playerRow.appendChild(rankMarker);

            const playerIdCell = document.createElement("div");
            playerIdCell.classList.add("grid-cell", "player-id");

            const playerName = document.createElement("span");
            playerName.textContent = player.playerId;
            playerName.classList.add("player-name");
            playerIdCell.appendChild(playerName);

            playerName.addEventListener("click", () => changePage(`/profile/${player.playerId}`));

            const playerRank = document.createElement("app-rank");
            playerRank.setAttribute("rank", player.rank.split(" ")[0].toLowerCase());
            playerRank.classList.add("rank-icon");
            playerIdCell.appendChild(playerRank);

            const pointsText = document.createElement("span");
            pointsText.textContent = Math.round(player.tronPoints).toLocaleString() + " TP";
            pointsText.classList.add("points-text");

            playerRow.appendChild(playerIdCell);
            playerRow.appendChild(pointsText);

            this.topList.appendChild(playerRow);
        });
    }
}
