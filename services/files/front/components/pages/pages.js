export class Pages extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        fetch("/components/pages/pages.html")
            .then(response => response.text())
            .then(text => {
                this.shadowRoot.innerHTML = text;
                this.#showElement("home");
            });
        document.addEventListener("menu-selection", (event) => {
            this.#showElement(event.detail);
        });
    }

    #showElement(elementId) {
        const elements = this.shadowRoot.querySelectorAll("#pages > *");
        elements.forEach(element => {
            element.style.display = element.id === elementId ? "block" : "none";
        });
    }
}
