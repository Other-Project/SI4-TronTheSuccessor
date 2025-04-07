import {HTMLComponent} from "/js/component.js";

export class Button extends HTMLComponent {

    static get observedAttributes() {
        return ["background", "pulse"];
    }

    constructor() {
        super("button", ["css"]);
        this.button = document.createElement("button");
        this.button.appendChild(document.createElement("slot"));
        this.shadowRoot.appendChild(this.button);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    onSetupCompleted = () => this.#refresh();

    #refresh() {
        if (!this.background) return;
        this.button.classList.add(this.background);
        this.button.classList.toggle("pulse", this.pulse === "true");
    }
}
