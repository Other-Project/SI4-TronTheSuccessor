export class HelpPage extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({mode: "open"});
        fetch("/components/help-page/help-page.html").then(
            async help => shadow.innerHTML = await help.text()
        )

        fetch('/components/help-page/help-page.css').then(async stream => {
            const style = document.createElement('style');
            style.textContent = await stream.text();
            shadow.appendChild(style);
        })
    }
}