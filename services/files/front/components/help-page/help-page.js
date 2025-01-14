export class HelpPage extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({mode: "open"});
        fetch("/components/help-page/help-page.html").then(
            async help => shadow.innerHTML = await help.text()
        )
    }
}