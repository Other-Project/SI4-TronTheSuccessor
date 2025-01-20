export class Pages extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        fetch("/components/pages/pages.html")
            .then(response => response.text())
            .then(text => {
                this.shadowRoot.innerHTML = text;
                this.shadowRoot.getElementById("game").style.display = "none";
                this.shadowRoot.getElementById("profil").style.display = "none";
            });
        document.addEventListener("menu-selection", (event) => {
            this.#showElement(event.detail);
        });
    }

    #showElement(elementId) {
        const elements = this.shadowRoot.querySelectorAll("#pages > *");
        console.log(elements);
        elements.forEach(element => {
            element.style.display = element.id === elementId ? "block" : "none";
        });
    }
}
