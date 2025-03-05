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
        const input_answer = this.shadowRoot.getElementById("answer");
        if (this.pattern) input_answer.setAttribute("pattern", this.pattern);
        if (this.type) input_answer.setAttribute("type", this.type);
    };
}
