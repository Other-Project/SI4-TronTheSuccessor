import {HTMLComponent} from "/js/component.js";
import {fetchApi} from "/js/login-manager.js";
import {changePage} from "/components/pages/pages.js";

export class ChatRoomButton extends HTMLComponent {
    static get observedAttributes() {
        return ["icon", "name", "preview", "friend"];
    }

    constructor() {
        super("chat-room-button", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.roomIcon = this.shadowRoot.getElementById("room-icon");
        this.roomName = this.shadowRoot.getElementById("room-name");
        this.roomPreview = this.shadowRoot.getElementById("room-preview");
        this.roomFightIcon = this.shadowRoot.getElementById("icon-fight");
        this.roomFightIcon.addEventListener("click", async e => {
            e.stopPropagation();
            const message = {
                type: "game-invitation",
                content: "Fight me!"
            };
            const response = await fetchApi(`/api/chat/${this.name}`, {
                method: "POST",
                body: JSON.stringify(message)
            });
            if (!response.ok) {
                alert(`Failed to send game invitation: ${response.statusText}`);
                return;
            }
            changePage("/game/" + btoa(this.name));
        });
    };

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.roomIcon) return;
        this.roomIcon.src = this.icon;
        this.roomName.textContent = this.name;
        this.roomPreview.textContent = this.preview;
        this.roomFightIcon.style.display = this.friend === "true" ? "block" : "none";
    }
}
