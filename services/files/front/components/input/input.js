import {HTMLComponent} from "/js/component.js";

export class Input extends HTMLComponent {
    pattern;
    type;

    // noinspection JSUnusedGlobalSymbols
    static get observedAttributes() {
        return ["pattern", "type"];
    }

    constructor() {
        super("input", ["html", "css"]);
    }

    // noinspection JSUnusedGlobalSymbols
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "pattern") this.pattern = newValue;
        if (name === "type") this.type = newValue;
    }

    onSetupCompleted = () => {
        if (this.pattern) this.shadowRoot.getElementById("answer").setAttribute("pattern", this.pattern);
        if (this.type) this.shadowRoot.getElementById("answer").setAttribute("type", this.type);
    };
}
