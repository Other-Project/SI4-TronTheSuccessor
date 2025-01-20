export class ProfilPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        fetch("/components/profil-page/app-profil-page/profil-page.html")
            .then(response => response.text())
            .then(text => {
                this.shadowRoot.innerHTML = text;
                this.shadowRoot.getElementById("home").addEventListener("click", () => {
                    document.dispatchEvent(new CustomEvent("home-start"));
                });
            });
    }
}
