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
        if (path?.startsWith("/")) this.path = path;
        else this.path = path ? `/components/${path}/${componentName}` : `/components/${componentName}`;

        this.#setup().then(() => new IntersectionObserver((entries) => {
            this.#visibilityChanged(entries[0].isIntersecting);
        }, {root: document}).observe(this));
    }

    #visibilityChanged(visible) {
        if (visible) this.#callEvent(this.onVisible);
        else this.#callEvent(this.onHidden);
        this.visible = visible;
    }

    #callEvent(event) {
        if (this.#setupCompleted && event) event();
    }

    async #setup() {
        if (this.#setupCompleted) return;

        if (this.fileDependencies.includes("css")) {
            const styleUrl = `${this.path}/${this.componentName}.css`;
            if ("adoptedStyleSheets" in this.shadowRoot) {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(await getResource(styleUrl));
                this.shadowRoot.adoptedStyleSheets.push(sheet);
            } else this.shadowRoot.innerHTML += `<link rel="stylesheet" href="${styleUrl}">`; // Fallback for older browsers
        }
        if (this.fileDependencies.includes("html"))
            this.shadowRoot.innerHTML += await getResource(`${this.path}/${this.componentName}.html`);

        this.#setupCompleted = true;
        await new Promise(res => setTimeout(res, 10)); // Workaround for letting the component initialize
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


const resources = {}; // Cache for resources
const loadingResources = new Set(); // Set of resources that are currently being loaded

/**
 * Fetches a resource and caches it
 * @param url The URL of the resource
 * @returns {Promise<*|string>} The resource
 */
async function getResource(url) {
    if (resources[url]) return resources[url];
    if (loadingResources.has(url)) {
        while (loadingResources.has(url)) await new Promise(res => setTimeout(res, 10));
        if (resources[url]) return resources[url]; // If the resource was loaded successfully while waiting, return it
    }

    loadingResources.add(url);
    const response = await fetch(url);
    if (!response.ok) {
        loadingResources.delete(url);
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    resources[url] = await response.text();
    loadingResources.delete(url);
    return resources[url];
}
