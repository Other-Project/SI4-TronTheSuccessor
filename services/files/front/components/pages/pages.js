import {HTMLComponent} from "/js/component.js";

export class Pages extends HTMLComponent {
    constructor() {
        super("/components/pages", "pages.html");
        document.addEventListener("menu-selection", (event) => {
            this.#showElement(event.detail);
        });
    }

    onVisible = () => {
        this.#showElement("home");
    }

    #showElement(elementId) {
        const elements = this.shadowRoot.querySelectorAll("#pages > *");
        elements.forEach(element => {
            element.style.display = element.id === elementId ? "block" : "none";
        });
    }
}
