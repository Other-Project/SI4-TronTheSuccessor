import {HTMLComponent} from "/js/component.js";

export class SettingsCarousel extends HTMLComponent {

    constructor() {
        super("settings-carousel", ["html", "css"], "settings");
    }

    onSetupCompleted = () => {

    };

    onVisible = async () => {
        const svgImgs = this.shadowRoot.querySelectorAll(".image");
        const colors = [{
            "primary-color": "#f43535",
            "secondary-color": "#f3b8b8"
        },
            {
                "primary-color": "#f4b835",
                "secondary-color": "#f3e8b8"
            },
            {
                "primary-color": "#f4f435",
                "secondary-color": "#e8f3b8"
            },
            {
                "primary-color": "#35f4a5",
                "secondary-color": "#b8f3e8"
            },
            {
                "primary-color": "#35a5f4",
                "secondary-color": "#b8e8f3"
            },
            {
                "primary-color": "#354af4",
                "secondary-color": "#b8b8f3"
            }];

        for (const svgImg of svgImgs) {
            const svgElement = await this.#loadSpaceshipSVG(svgImg.src);
            const randomIndex = Math.floor(Math.random() * colors.length);
            for (const key in colors[randomIndex]) svgElement.style.setProperty(`--custom-${key}`, colors[randomIndex][key]);
            const img = await this.#SVGtoImage(svgElement);
            img.className = svgImg.className;
            svgImg.replaceWith(img);
        }
    };

    async #loadSpaceshipSVG(url) {
        const SVG_NS = "http://www.w3.org/2000/svg";
        const parser = new DOMParser();

        const svgString = await fetch(url).then(response => response.text());
        const doc = parser.parseFromString(svgString, "image/svg+xml");
        const svgElement = doc.getElementsByTagNameNS(SVG_NS, "svg").item(0);
        return svgElement;
    }

    /**
     * Convert an SVG element to an HTMLImageElement
     * @param {SVGElement} svgElement The SVG element to convert
     * @returns {Promise<HTMLImageElement>} The converted image
     */
    async #SVGtoImage(svgElement) {
        return new Promise((resolve, reject) => {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = (error) => {
                URL.revokeObjectURL(url);
                reject(error);
            };
            img.src = url;
        });
    }
}
