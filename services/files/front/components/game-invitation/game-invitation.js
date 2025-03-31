import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";
import {fetchApi, getCookie} from "/js/login-manager.js";

export class GameInvitation extends HTMLComponent {
    constructor() {
        super("game-invitation", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.invitationPopups = this.shadowRoot.querySelectorAll("app-popup");

        this.addEventListener("hide-popup", () => {
            this.invitationPopups.forEach((popup) => popup.classList.remove("show"));
        });

        document.addEventListener("show-invitation", (event) => {
            this.invitationPopups.forEach((popup) => {
                if (popup.classList.toggle("show", event.detail.popupId === popup.id)) {
                    const popupName = popup.id.split("-")[0];
                    this.shadowRoot.getElementById(`${popupName}-avatar`).src = event.detail.avatar;
                    this.shadowRoot.getElementById(`${popupName}-name`).textContent = this.name = event.detail.name;
                    this.shadowRoot.getElementById(`${popupName}-content`).textContent = event.detail.content;
                }
            });
        });

        this.shadowRoot.getElementById("");

        this.shadowRoot.getElementById("send-game-invitation").addEventListener("click", async () => {
            this.invitationPopups.forEach((popup) => popup.classList.remove("show"));
            changePage("/game/" + btoa(this.name));
        });

        this.shadowRoot.getElementById("accept-invitation").addEventListener("click", async () => {
            this.invitationPopups.forEach((popup) => popup.classList.remove("show"));
            await this.#updateGameInvitationStatus("accepted");
            changePage("/game/" + btoa(this.name));
        });

        this.shadowRoot.getElementById("dont-send-invitation").addEventListener("click", () => {
            this.invitationPopups.forEach((popup) => popup.classList.remove("show"));
        });

        this.shadowRoot.getElementById("refuse-invitation").addEventListener("click", async () => {
            this.invitationPopups.forEach((popup) => popup.classList.remove("show"));
            await this.#updateGameInvitationStatus("refused");
            document.cookie = "gameInvitation=; path=/; max-age=0;";
            this.dispatchEvent(new CustomEvent("hide-drawer"));
        });
    };

    #updateGameInvitationStatus = async (status) => {
        const response = await fetchApi("/api/chat/game-invitation", {
            method: "PUT",
            body: JSON.stringify({gameInvitationToken: getCookie("gameInvitationToken"), status})
        });
        if (!response.ok) {
            alert(response.statusText);
        }
    };
}
