import {HTMLComponent} from "/js/component.js";

export class ChatRoomButton extends HTMLComponent {
    static get observedAttributes() {
        return ["icon", "name", "preview", "fight"];
    }

    constructor() {
        super("chat-room-button", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.roomIcon = this.shadowRoot.getElementById("room-icon");
        this.roomName = this.shadowRoot.getElementById("room-name");
        this.roomPreview = this.shadowRoot.getElementById("room-preview");
        this.roomFightIcon = this.shadowRoot.getElementById("icon-fight");
        this.roomFightIcon.addEventListener("click", e => {
            e.stopPropagation();
            alert("Challenge this friend ?");
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
        this.roomFightIcon.style.display = this.fight === "true" ? "block" : "none";
    }
}
