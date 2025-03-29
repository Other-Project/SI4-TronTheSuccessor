import {HTMLComponent} from "/js/component.js";

export class HelpPage extends HTMLComponent {
    against = "local";

    static get observedAttributes() {
        return ["against"];
    }

    constructor() {
        super("help-page", ["html"]);
    }

    onSetupCompleted = () => this.controls = this.shadowRoot.getElementById("controls");

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.controls) return;
        this.controls.querySelector("[owner=\"2\"]").style.display = this.against === "local" ? "block" : "none";
    }
}
