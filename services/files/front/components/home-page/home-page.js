export class HomePage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        fetch("/components/home-page/home-page.html")
            .then(response => response.text())
            .then(text => {
                this.shadowRoot.innerHTML = text;
                this.shadowRoot.getElementById("connect").addEventListener("click", () => {
                    document.dispatchEvent(new CustomEvent("profil-start"));
                });
            });
    }
}
