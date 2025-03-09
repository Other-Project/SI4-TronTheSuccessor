import {HTMLComponent} from "/js/component.js";

export class HelpPage extends HTMLComponent {
    against = "local";

    static get observedAttributes() {
        return ["against"];
    }

    constructor() {
        super("help-page", ["html"]);
        document.addEventListener("keyup", async (event) => {
            if (event.code === "Space" && this.checkVisibility()) {
                document.dispatchEvent(new CustomEvent("menu-selection", {
                    detail: {
                        name: "game",
                        attr: {against: this.against}
                    }
                }));
            }
        });
    }

    onSetupCompleted = () => {
        this.controls = this.shadowRoot.getElementById("controls");
        this.#refresh();
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.controls) return;
        this.controls.querySelector("[owner=\"2\"]").style.display = this.against === "local" ? "block" : "none";
    }
}