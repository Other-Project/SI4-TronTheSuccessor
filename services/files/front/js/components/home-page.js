export class HomePage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        fetch("/js/components/home-page.html")
            .then(response => response.text())
            .then(text => {
                this.shadowRoot.innerHTML = text;
            });
    }
}