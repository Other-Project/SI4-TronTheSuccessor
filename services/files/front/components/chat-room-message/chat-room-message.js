import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";

export class ChatRoomMessage extends HTMLComponent {
    /** @type {string} */ author;
    /** @type {string} */ content;
    /** @type {Date} */ date;
    /** @type {"text"|"friend-request"|"game-invitation"} */ type;
    /** @type {boolean} */ you;

    static get observedAttributes() {
        return ["author", "content", "date", "type", "you"];
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
        this.authorElement.addEventListener("click", () => changePage(`/profile/${this.author}`));
    };

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "date") this.date = new Date(newValue);
        if (name === "you") this.you = newValue === "true";
        this.#refresh();
    }

    #refresh() {
        if (!this.containerElement) return;
        this.containerElement.classList.toggle("you", this.you);
        this.avatarElement.setAttribute("username", this.author);
        this.authorElement.textContent = this.you ? "You" : this.author;
        this.contentElement.textContent = this.content;
        this.dateElement.textContent = this.date.toLocaleString();
    }
}
