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
        const popupContainer = this.shadowRoot.getElementById("popup-container");
        this.shadowRoot.getElementById("popup-panel").style.background = this.background;
        popupContainer.addEventListener("click", (event) => {
            if (event.target === popupContainer) {
                document.dispatchEvent(new CustomEvent("hide-login-popup"));
            }
        });
    };
}
