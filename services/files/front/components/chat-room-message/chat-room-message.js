import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";
import {fetchApi, storeTokens, tryUpdatingGameInvitationStatus} from "/js/login-manager.js";

export class ChatRoomMessage extends HTMLComponent {
    /** @type {string} */ author;
    /** @type {string} */ content;
    /** @type {Date} */ date;
    /** @type {"text"|"friend-request"|"game-invitation"} */ type;
    /** @type {boolean} */ you;
    /** @type {boolean} */ expired;

    static get observedAttributes() {
        return ["author", "content", "date", "type", "you", "expired", "status"];
    }

    constructor() {
        super("chat-room-message", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.containerElement = this.shadowRoot.getElementById("message-container");
        this.avatarElement = this.shadowRoot.getElementById("sender-avatar");
        this.authorElement = this.shadowRoot.getElementById("sender-name");
        this.contentElement = this.shadowRoot.getElementById("message-content");
        this.dateElement = this.shadowRoot.getElementById("message-date");
        this.acceptGameInvitation = this.shadowRoot.getElementById("accept-game-invitation");
        this.refuseGameInvitation = this.shadowRoot.getElementById("refuse-game-invitation");
        this.gameInvitation = this.shadowRoot.getElementById("game-invitation");
        this.acceptGameInvitation.addEventListener("click", async () => {
            storeTokens(this);
            if (await tryUpdatingGameInvitationStatus("accepted", this.gameInvitationToken))
                changePage("/game/" + btoa(this.author));
        });
        this.refuseGameInvitation.addEventListener("click", async () => {
            if (await tryUpdatingGameInvitationStatus("refused", this.gameInvitationToken)) {
                const response = await fetchApi("/api/game/game-invitation/refuse", {
                    method: "POST",
                    body: this.author
                });
                if (!response.ok) {
                    document.dispatchEvent(new CustomEvent("show-notification", {
                        detail: {
                            message: "An error happened. Failed to refuse the game invitation",
                            duration: 5000,
                            background: "#f11818",
                            color: "#000000"
                        }
                    }));
                    return;
                }
                document.dispatchEvent(new CustomEvent("hide-drawer"));
                document.dispatchEvent(new CustomEvent("show-notification", {
                    detail: {
                        message: `Game invitation from ${this.author} refused.`,
                        duration: 5000,
                        background: "#41ff00",
                        color: "#000000"
                    }
                }));
                document.cookie = "gameInvitationToken=; path=/; max-age=0;";
            }
        });
        this.authorElement.addEventListener("click", () => changePage(`/profile/${this.author}`));
    };

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "date") this.date = new Date(newValue);
        if (name === "you") this.you = newValue === "true";
        if (name === "expired") this.expired = newValue === "true";
        this.#refresh();
    }

    #refresh() {
        if (!this.containerElement) return;
        this.containerElement.classList.toggle("you", this.you);
        this.avatarElement.src = `/api/user/${this.author}/avatar`;
        this.authorElement.textContent = this.you ? "You" : this.author;
        this.contentElement.textContent = this.content;
        this.dateElement.textContent = this.date.toLocaleString();
        if (this.expired !== undefined) {
            this.gameInvitation.classList.add("show");
        }
    }
}
