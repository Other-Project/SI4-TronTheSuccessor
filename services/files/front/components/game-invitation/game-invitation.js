import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";
import {fetchApi, getUserInfo, storeTokens} from "/js/login-manager.js";

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
            this.shadowRoot.getElementById(`send-avatar`).setAttribute("username", event.detail.name);
            this.shadowRoot.getElementById(`send-name`).textContent = this.name = event.detail.name;
            this.shadowRoot.getElementById(`send-content`).textContent = event.detail.content;
            this.sendGameInvitation.classList.add("show");
        });

        this.sendButtonInvitation.addEventListener("click", async () => {
            this.sendGameInvitation.classList.remove("show");
            await this.#sendGameInvitation();
            changePage("/game/" + btoa(this.name));
        });

        this.shadowRoot.getElementById("dont-send-invitation").addEventListener("click", async () => {
            this.sendGameInvitation.classList.remove("show");
        });
    };

    async #sendGameInvitation() {
        const message = {
            type: "game-invitation",
            content: "Game invitation from " + getUserInfo().username
        };
        const response = await fetchApi(`/api/chat/${this.name}`, {
            method: "POST",
            body: JSON.stringify(message)
        });
        if (!response.ok) {
            document.dispatchEvent(new CustomEvent("show-notification", {
                detail: {
                    message: "An error happened. Failed to send game invitation",
                    duration: 5000,
                    background: "#f11818",
                    color: "#000000"
                }
            }));
            return;
        }
        storeTokens(await response.json());
    }
}
