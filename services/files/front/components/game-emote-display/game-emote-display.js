import {HTMLComponent} from "/js/component.js";

export class GameEmoteDisplay extends HTMLComponent {
    player;
    emote;

    static get observedAttributes() {
        return ["player", "emote"];
    }

    constructor() {
        super("game-emote-display", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.container = this.shadowRoot.querySelector(".container");
        this.emoteSender = this.shadowRoot.getElementById("emote-sender");
        this.emoteImg = this.shadowRoot.getElementById("emote-img");
    }

    onVisible = () => {
        this.container.classList.add("visible");
        this.emoteImg.title = this.emoteSender.alt = this.player;
        this.emoteSender.src = `/api/user/${this.player}/avatar`;
        this.emoteImg.title = this.emoteImg.alt = this.emote;
        this.emoteImg.src = `/assets/emotes/${this.emote}.png`;
        setTimeout(() => this.remove(), 5000);
    }
}
