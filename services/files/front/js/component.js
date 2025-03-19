/**
 * A class that represents a custom HTML element
 */
export class HTMLComponent extends HTMLElement {
    /** Called when the component finished loading */               onSetupCompleted;
    /** Called each time the component is visible on the page */    onVisible;
    /** Called each time the component is hidden */                 onHidden;

    #setupCompleted = false;

    /**
     * Create a new HTMLComponent
     * @param {string} componentName The name of the component
     * @param {("html"|"css")[]} fileDependencies The files that the component depends on and should be loaded
     * @param {string} path The path to the component files
     */
    constructor(componentName, fileDependencies = undefined, path = undefined) {
        super();
        if (!RegExp(/^[a-z-]+$/).exec(componentName)) throw new Error("Invalid component name");
        this.attachShadow({mode: "open"});

        this.componentName = componentName;
        this.fileDependencies = fileDependencies ?? [];
        this.path = path ?? `/components/${componentName}`;

        this.#setup().then(() => new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) this.#callEvent(this.onVisible);
            else this.#callEvent(this.onHidden);
        }, {root: document}).observe(this));
    }

    #callEvent(event) {
        if (this.#setupCompleted && event) event();
    }

    async #setup() {
        if (this.#setupCompleted) return;

        if (this.fileDependencies.includes("html"))
            this.shadowRoot.innerHTML = await fetch(`${this.path}/${this.componentName}.html`).then(response => response.text());
        if (this.fileDependencies.includes("css")) {
            if ("adoptedStyleSheets" in this.shadowRoot) {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(await fetch(`${this.path}/${this.componentName}.css`).then(response => response.text()));
                this.shadowRoot.adoptedStyleSheets.push(sheet);
            } else this.innerHTML += `<link rel="stylesheet" href="${this.path}/${this.componentName}.css">`; // Fallback for older browsers

        }

        this.#setupCompleted = true;
        this.#callEvent(this.onSetupCompleted);
    }

    /**
     * Called when an attribute is set through the HTML tag
     * @param name The attribute name
     * @param oldValue The old value of the attribute
     * @param newValue The new value of the attribute
     */
    // noinspection JSUnusedGlobalSymbols
    attributeChangedCallback(name, oldValue, newValue) {
        if (this.constructor.observedAttributes?.includes(name)) this[name] = newValue;
    }
}
