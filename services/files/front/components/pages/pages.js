export class Pages extends HTMLElement {

    #showElement(elementId) {
        const elements = ["app-home-page", "app-game-board", "app-profil-page"];
        elements.forEach(element => {
            this.shadowRoot.getElementById(element).style.display = element === elementId ? "block" : "none";
        });
    }

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        fetch("/components/pages/pages.html")
            .then(response => response.text())
            .then(text => {
                this.shadowRoot.innerHTML = text;
                this.shadowRoot.getElementById("app-game-board").style.display = "none";
                this.shadowRoot.getElementById("app-profil-page").style.display = "none";
            });

        document.addEventListener("game-start", () => {
            this.#showElement("app-game-board");
        });

        document.addEventListener("profil-start", () => {
            this.#showElement("app-profil-page");
        });

        document.addEventListener("home-start", () => {
            this.#showElement("app-home-page");
        });
    }
}
