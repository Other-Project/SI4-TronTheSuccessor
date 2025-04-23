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
        return ["author", "content", "date", "type", "you", "expired", "status", "connected"];
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
        this.status = this.shadowRoot.getElementById("status-indicator");
        this.acceptGameInvitation = this.shadowRoot.getElementById("accept-game-invitation");
        this.refuseGameInvitation = this.shadowRoot.getElementById("refuse-game-invitation");
        this.gameInvitation = this.shadowRoot.getElementById("game-invitation");
        this.acceptGameInvitation.addEventListener("click", async () => {
            storeTokens(this);
            if (await tryUpdatingGameInvitationStatus("accepted", this.gameInvitationToken))
                changePage("/game/" + btoa(this.author));
            else
                this.#show_notification("Game invitation was already cancelled", 5000, "#f11818", "#000000");
            this.dispatchEvent(new CustomEvent("refresh-chat-room", {
                bubbles: true,
                composed: true
            }));
        });
        this.refuseGameInvitation.addEventListener("click", async () => {
            if (await tryUpdatingGameInvitationStatus("refused", this.gameInvitationToken)) {
                const response = await fetchApi("/api/game/game-invitation/refuse", {
                    method: "POST",
                    body: this.author
                });
                if (!response.ok) {
                    this.#show_notification("An error happened. Failed to refuse the game invitation", 5000, "#f11818", "#000000");
                    return;
                }
                document.dispatchEvent(new CustomEvent("hide-drawer"));
                this.dispatchEvent(new CustomEvent("refresh-chat-room", {
                    bubbles: true,
                    composed: true
                }));
                this.#show_notification(`Game invitation from ${this.author} refused.`, 5000, "#41ff00", "#000000");
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
        this.status.classList.toggle("connected", this.connected === "true");
        this.status.classList.toggle("hidden", this.you);
        this.avatarElement.setAttribute("username", this.author);
        this.authorElement.textContent = this.you ? "You" : this.author;
        this.contentElement.textContent = this.content;
        this.dateElement.textContent = this.date.toLocaleString();
        if (this.expired !== undefined) {
            this.gameInvitation.classList.add("show");
        }
    }

    #show_notification(message, duration, background, color) {
        document.dispatchEvent(new CustomEvent("show-notification", {
            detail: {
                message, duration, background, color
            }
        }));
    }
}
