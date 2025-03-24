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
        super("input", ["css"]);
        this.shadowRoot.innerHTML = "<div class=\"group-input\">\n" +
            "    <input autofocus id=\"answer\" placeholder=\"Answer\" required type=\"text\">\n" +
            "    <label for=\"answer\">\n" +
            "        <slot></slot>\n" +
            "    </label>\n" +
            "    <button id=\"show-password\" type=\"button\">\n" +
            "        <img alt=\"show\" src=\"/assets/password_hide.svg\">\n" +
            "    </button>\n" +
            "</div>\n";

        this.input_answer = this.shadowRoot.getElementById("answer");
        this.show_password = this.shadowRoot.getElementById("show-password");
        this.show_password.addEventListener("click", () => {
            const should_show_password = this.input_answer.type === "password";
            this.input_answer.type = should_show_password ? "text" : "password";
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
        if (!this.input_answer) return;
        if (this.pattern) this.input_answer.setAttribute("pattern", this.pattern);
        if (this.type) {
            this.input_answer.setAttribute("type", this.type);
            if (this.type === "password") this.show_password.style.display = "block";
        }
    }
}
