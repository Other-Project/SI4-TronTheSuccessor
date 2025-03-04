import {HTMLComponent} from "/js/component.js";

export class Popup extends HTMLComponent {
    background;

    // noinspection JSUnusedGlobalSymbols
    static get observedAttributes() {
        return ["background"];
    }

    constructor() {
        super("popup", ["html", "css"]);
    }

    // noinspection JSUnusedGlobalSymbols
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "background") this.background = newValue;
    }

    onVisible = () => {
        this.shadowRoot.getElementById("popup-panel").style.background = this.background;
    };
}
