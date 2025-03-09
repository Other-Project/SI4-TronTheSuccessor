import {HTMLComponent} from "/js/component.js";

export class Button extends HTMLComponent {

    constructor() {
        super("button", ["css"]);
        this.button = document.createElement("button");
        this.button.appendChild(document.createElement("slot"));
        this.shadowRoot.appendChild(this.button);
    }
}
