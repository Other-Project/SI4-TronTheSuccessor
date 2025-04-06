import {HTMLComponent} from "/js/component.js";

export class Badge extends HTMLComponent {
    static get observedAttributes() {
        return ["background", "text", "border"];
    }

    constructor() {
        super("badge", ["css"]);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh = () => {
        if (!this.shadowRoot) return;
        this.style.backgroundColor = this.background;
        this.style.innerText = this.text;
        this.style.borderColor = this.border;
    };
}
