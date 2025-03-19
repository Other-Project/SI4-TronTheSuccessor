import {HTMLComponent} from "/js/component.js";
import {emotes} from "/js/game.js";

export class GameEmotes extends HTMLComponent {
    constructor() {
        super("game-emotes", ["css"]);
    }

    onSetupCompleted = () => {
        this.emoteList = document.createElement("div");
        this.emoteList.classList.add("container");
        this.shadowRoot.appendChild(this.emoteList);
    }

    onVisible = () => {
        this.emoteList.innerHTML = "";
        emotes.forEach((emote, i) => {
            const div = document.createElement("div");
            div.classList.add("emote");

            const img = document.createElement("img");
            img.src = `/assets/emotes/${emote}.png`;
            img.title = img.alt = emote;
            div.appendChild(img);

            const p = document.createElement("p");
            p.innerText = ((i + 1) % 10).toString();
            div.appendChild(p);

            div.addEventListener("click", () => this.dispatchEvent(new CustomEvent("emote", {detail: {emote}})));
            this.emoteList.appendChild(div);
        });
    }
}
