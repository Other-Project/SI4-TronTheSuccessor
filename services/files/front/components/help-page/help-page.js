export class HelpPage extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({mode: "open"});
        fetch("/components/help-page/help-page.html").then(
            async help => shadow.innerHTML = await help.text()
        )
        let stylesheet = document.createElement("link");
        stylesheet.href = "/components/help-page/help-page.css";
        stylesheet.rel = "stylesheet";
        stylesheet.type = "text/css";
        shadow.appendChild(stylesheet);
    }
}