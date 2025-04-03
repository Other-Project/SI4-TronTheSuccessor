import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";

export class GameInvitation extends HTMLComponent {
    constructor() {
        super("game-invitation", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.sendGameInvitation = this.shadowRoot.getElementById("send-game-invitation");
        this.sendButtonInvitation = this.shadowRoot.getElementById("send-invitation");

        this.addEventListener("hide-popup", () => {
            this.sendGameInvitation.classList.remove("show");
        });

        document.addEventListener("show-invitation", (event) => {
            this.shadowRoot.getElementById(`send-avatar`).src = event.detail.avatar;
            this.shadowRoot.getElementById(`send-name`).textContent = this.name = event.detail.name;
            this.shadowRoot.getElementById(`send-content`).textContent = event.detail.content;
            this.sendGameInvitation.classList.add("show");
        });

        this.sendButtonInvitation.addEventListener("click", async () => {
            this.sendGameInvitation.classList.remove("show");
            changePage("/game/" + btoa(this.name));
        });

        this.shadowRoot.getElementById("dont-send-invitation").addEventListener("click", async () => {
            this.sendGameInvitation.classList.remove("show");
        });
    };
}
