import {HTMLComponent} from "/js/component.js";
import notificationService from "/js/notification.js";
import {getUserInfo} from "/js/login-manager.js";

export class HomePage extends HTMLComponent {
    constructor() {
        super("home-page", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.onlinePlayersCount = this.shadowRoot.getElementById("player-count");
        this.onlinePlayers = this.shadowRoot.getElementById("online-players-counter");
        notificationService.addEventListener("user-count-update", (event) => {
            this.onlinePlayersCount.textContent = event.detail.nb;
            this.onlinePlayers.classList.toggle("hidden", getUserInfo() === null);
        });
    };
}
