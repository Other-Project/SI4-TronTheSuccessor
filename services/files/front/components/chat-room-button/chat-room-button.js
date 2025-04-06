import {HTMLComponent} from "/js/component.js";

export class ChatRoomButton extends HTMLComponent {
    static get observedAttributes() {
        return ["icon", "roomId", "name", "preview"];
    }

    constructor() {
        super("chat-room-button", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.roomIcon = this.shadowRoot.getElementById("room-icon");
        this.roomAvatar = this.shadowRoot.getElementById("room-avatar");
        this.roomName = this.shadowRoot.getElementById("room-name");
        this.roomPreview = this.shadowRoot.getElementById("room-preview");
    }

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (newValue === "null") this[name] = null;
        this.#refresh();
    }

    #refresh() {
        if (!this.roomName) return;
        if (!this.icon) this.roomAvatar.setAttribute("username", this.roomId);
        else this.roomIcon.src = this.icon;
        this.roomIcon.style.display = this.icon ? "block" : "none";
        this.roomAvatar.style.display = this.icon ? "none" : "block";
        this.roomName.textContent = this.name;
        this.roomPreview.textContent = this.preview;
    }
}
