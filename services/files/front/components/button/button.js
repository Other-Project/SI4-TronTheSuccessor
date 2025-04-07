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
        if (name === "background" && oldValue)
                this.button.classList.remove(oldValue);
        this.#refresh();
    }

    onSetupCompleted = () => this.#refresh();

    #refresh() {
        this.button.classList.add(this.background);
        this.button.classList.toggle("pulse", this.pulse === "true");
    }
}
