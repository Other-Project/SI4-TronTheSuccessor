import {HTMLComponent} from "/js/component.js";

export class Button extends HTMLComponent {
    background;
    pulse;

    static get observedAttributes() {
        return ["background", "pulse"];
    }

    constructor() {
        super("button", ["css"]);
        const btn = document.createElement("button");
        btn.appendChild(document.createElement("slot"));
        this.shadowRoot.appendChild(btn);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "background" && oldValue) this.button.classList.remove(oldValue);
        this.#refresh();
    }

    onSetupCompleted = () => {
        this.button = this.shadowRoot.querySelector("button");
        this.#refresh();
    }

    #refresh() {
        if (!this.button) return;
        this.button.classList.add(this.background);
        this.button.classList.toggle("pulse", this.pulse === "true");
    }
}
