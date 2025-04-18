import {HTMLComponent} from "/js/component.js";

export class LoadingSpinner extends HTMLComponent {
    show;

    static get observedAttributes() {
        return ["show"];
    }

    constructor() {
        super("loading-spinner", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.spinner = this.shadowRoot.getElementById("loading-spinner");
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "show" && oldValue)
            this.spinner.classList.remove(oldValue);
        this.#refresh();
    }

    #refresh() {
        this.spinner.classList.toggle("show", this.show === "true");
    }
}
