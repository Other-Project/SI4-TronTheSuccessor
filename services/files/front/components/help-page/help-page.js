import {HTMLComponent} from "/js/component.js";

export class HelpPage extends HTMLComponent {
    against = "local";

    static get observedAttributes() {
        return ["against"];
    }

    constructor() {
        super("help-page", ["html"]);
    }

    onSetupCompleted = () => {
        this.controls = this.shadowRoot.getElementById("controls");
        this.rankPopUp = this.shadowRoot.getElementById("rank-popup");
        this.rankPopUp.style.display = "none";
        this.displayAgain = this.shadowRoot.getElementById("display-again");

        if (localStorage.getItem("rank-popup")) this.displayAgain.checked = true;
        this.shadowRoot.addEventListener("hide-popup", () => {
            this.rankPopUp.style.display = "none";
            if (this.displayAgain.checked) localStorage.setItem("rank-popup", "false");
            else localStorage.removeItem("rank-popup");
        });
    };

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.controls) return;
        this.controls.querySelector("[owner=\"2\"]").style.display = this.against === "local" ? "block" : "none";
        if (this.against === "any-player" && !localStorage.getItem("rank-popup")) this.rankPopUp.style.display = "block";
    }
}
