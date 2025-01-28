exports = class HTMLComponent extends HTMLElement {
    /** Called when the component finished loading */               onSetupCompleted;
    /** Called each time the component is visible on the page */    onVisible;
    /** Called each time the component is hidden */                 onHidden;

    #setupCompleted = false;

    constructor(path, html, css) {
        super();
        this.attachShadow({mode: "open"});

        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting)
                this.#setup(path?.endsWith('/') ? path.slice(0, -1) : path, html, css).then(() => this.#callEvent(this.onVisible));
            else this.#callEvent(this.onHidden);
        }, {root: document}).observe(this);
    }

    #callEvent(event) {
        if (this.#setupCompleted && event) event();
    }

    async #setup(path, html, css) {
        if (this.#setupCompleted) return;

        if (Array.isArray(html)) {
            if (html.includes("css")) css = path + ".css";
            if (html.includes("html")) html = path + ".html";
            else html = null;
            path = `/components/${path}`;
        }

        if (html) this.shadowRoot.innerHTML = await fetch(path + "/" + html).then(response => response.text());
        if (css) {
            const sheet = new CSSStyleSheet();
            await sheet.replace(await fetch(path + "/" + css).then(response => response.text()));
            this.shadowRoot.adoptedStyleSheets.push(sheet);
        }
        this.#setupCompleted = true;
        this.#callEvent(this.onSetupCompleted);
    }
}
