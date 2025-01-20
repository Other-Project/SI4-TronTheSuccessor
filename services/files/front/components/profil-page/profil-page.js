export class ProfilPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        fetch("/components/profil-page/profil-page.html")
            .then(response => response.text())
            .then(text => {
                this.shadowRoot.innerHTML = text;
            });
    }
}