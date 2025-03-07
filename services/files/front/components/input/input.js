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
        const show_password = this.shadowRoot.getElementById("show-password");
        if (this.pattern) input_answer.setAttribute("pattern", this.pattern);
        if (this.type) {
            input_answer.setAttribute("type", this.type);
            if (this.type === "password") show_password.style.display = "block";
        }

        show_password.addEventListener("click", () => {
            const should_show_password = input_answer.type === "password";
            input_answer.type = should_show_password ? "text" : "password";
            this.shadowRoot.querySelector("img").src = should_show_password ? "/assets/password_show.svg" : "/assets/password_hide.svg";
        });
    };
}
