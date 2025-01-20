export class GameChoice extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        fetch("/components/game-choice/game-choice.html")
            .then(response => response.text())
            .then(text => {
                this.shadowRoot.innerHTML = text;
                this.shadowRoot.getElementById("local-game-button").addEventListener("click", () => {
                    document.dispatchEvent(new CustomEvent("game-start", {detail: {type: "local"}}));
                });
            });
    }
}
