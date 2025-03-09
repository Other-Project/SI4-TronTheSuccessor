import {HTMLComponent} from "/js/component.js";

export class Popup extends HTMLComponent {
    background;
    popupPanel;

    // noinspection JSUnusedGlobalSymbols
    static get observedAttributes() {
        return ["background"];
    }

    constructor() {
        super("popup", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.popupPanel = this.shadowRoot.getElementById("popup-panel");
        const popupContainer = this.shadowRoot.getElementById("popup-container");
        this.shadowRoot.getElementById("popup-panel").style.background = this.background;
        popupContainer.addEventListener("click", (event) => {
            if (event.target === popupContainer) {
                document.dispatchEvent(new CustomEvent("hide-popup"));
            }
        });
    };

    onVisible = () => this.#refresh();

    // noinspection JSUnusedGlobalSymbols
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.popupPanel) return;
        if (this.background) this.popupPanel.style.background = this.background;
    }
}
