import {HTMLComponent} from "/js/component.js";

export class Input extends HTMLComponent {
    /**@type {string} */ pattern;
    /**@type {string} */ type;

    input_answer;
    show_password;

    // noinspection JSUnusedGlobalSymbols
    static get observedAttributes() {
        return ["pattern", "type"];
    }

    constructor() {
        super("input", ["html", "css"]);
    }


    onSetupCompleted = () => {
        this.input_answer = this.shadowRoot.getElementById("answer");
        this.show_password = this.shadowRoot.getElementById("show-password");
        this.show_password.addEventListener("click", () => {
            const should_show_password = this.input_answer.type === "password";
            this.input_answer.type = should_show_password ? "text" : "password";
            this.shadowRoot.querySelector("img").src = should_show_password ? "/assets/password_show.svg" : "/assets/password_hide.svg";
        });
    };

    onVisible = () => this.#refresh();

    // noinspection JSUnusedGlobalSymbols
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "pattern") this.pattern = newValue;
        if (name === "type") this.type = newValue;
    }


    #refresh() {
        if (!this.pattern) return;
        if (this.pattern) this.input_answer.setAttribute("pattern", this.pattern);
        if (this.type) {
            this.input_answer.setAttribute("type", this.type);
            if (this.type === "password") this.show_password.style.display = "block";
        }
    }
}
