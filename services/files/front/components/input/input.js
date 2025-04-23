import {HTMLComponent} from "/js/component.js";

export class Input extends HTMLComponent {
    /**@type {string} */ pattern;
    /**@type {string} */ type;


    // noinspection JSUnusedGlobalSymbols
    static get observedAttributes() {
        return ["pattern", "type"];
    }

    constructor() {
        super("input", ["html", "css"]);

        this.input = null;
        this.revealButton = null;
    }

    onSetupCompleted = () => {
        this.input = this.shadowRoot.getElementById("answer");
        this.revealButton = this.shadowRoot.getElementById("show-password");
        this.revealButton.addEventListener("click", () => {
            const should_show_password = this.input.type === "password";
            this.input.type = should_show_password ? "text" : "password";
            this.shadowRoot.querySelector("img").src = should_show_password ? "/assets/password_show.svg" : "/assets/password_hide.svg";
        });
    }

    onVisible = () => this.#refresh();

    // noinspection JSUnusedGlobalSymbols
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.input) return;
        if (this.pattern) this.input.setAttribute("pattern", this.pattern);
        if (this.type) {
            this.input.setAttribute("type", this.type);
            if (this.type === "password") this.revealButton.style.display = "block";
        }
    }
}
