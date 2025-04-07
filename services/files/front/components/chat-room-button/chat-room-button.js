import {HTMLComponent} from "/js/component.js";

export class ChatRoomButton extends HTMLComponent {
    static get observedAttributes() {
        return ["icon", "roomId", "name", "preview", "friend"];
    }

    constructor() {
        super("chat-room-button", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.roomIcon = this.shadowRoot.getElementById("room-icon");
        this.roomAvatar = this.shadowRoot.getElementById("room-avatar");
        this.roomName = this.shadowRoot.getElementById("room-name");
        this.roomPreview = this.shadowRoot.getElementById("room-preview");
        this.roomFightIcon = this.shadowRoot.getElementById("icon-fight");
        this.roomFightIcon.addEventListener("click", async e => {
            e.stopPropagation();
            document.dispatchEvent(new CustomEvent("show-invitation", {
                detail: {
                    popupId: "send-game-invitation",
                    name: this.name,
                    avatar: this.icon,
                    content: `Do you want to play a game with ${this.name}?`
                }
            }));
        });
    };

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (newValue === "null") this[name] = null;
        this.#refresh();
    }

    #refresh() {
        if (!this.roomName) return;
        if (!this.icon) this.roomAvatar.setAttribute("username", this.name);
        else this.roomIcon.src = this.icon;
        this.roomIcon.style.display = this.icon ? "block" : "none";
        this.roomAvatar.style.display = this.icon ? "none" : "block";
        this.roomName.textContent = this.name;
        this.roomPreview.textContent = this.preview;
        this.roomFightIcon.style.display = this.friend === "true" ? "block" : "none";
    }
}
