export class ProfilPageButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        fetch("/components/profil-page/profil-page-button/profil-page-button.html")
            .then(response => response.text())
            .then(text => {
                this.shadowRoot.innerHTML = text;
            });
    }
}
