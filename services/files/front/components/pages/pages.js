import {HTMLComponent} from "/js/component.js";

export class Pages extends HTMLComponent {
    constructor() {
        super("/components/pages", "pages.html");
        document.addEventListener("menu-selection", (event) => {
            if (event.detail && typeof event.detail === "object") this.#showElement(event.detail.name, event.detail.attr);
            else this.#showElement(event.detail);
        });
    }

    onVisible = () => {
        this.#showElement("home");
    }

    /**
     * @param {string} elementId
     * @param {{string: string}} attr
     */
    #showElement(elementId, attr = undefined) {
        const elements = this.shadowRoot.querySelectorAll("#pages > *");
        elements.forEach(element => {
            if (element.id === elementId) {
                element.style.display = "block";
                if (attr) Object.entries(attr).forEach(([k, v]) => element.setAttribute(k, v));
            } else element.style.display = "none";
        });
    }
}
