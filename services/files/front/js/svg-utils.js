const SVG_NS = "http://www.w3.org/2000/svg";

export async function loadAndCustomiseSVG(url, colors) {
    const svgElement = await loadSVG(url);
    if (!svgElement) throw new Error(`SVG not found: ${url}`);
    for (const key in colors) svgElement.style.setProperty(`--custom-${key}`, colors[key]);
    return await SVGtoImage(svgElement);
}

const cache = {};

/**
 * Load an SVG file from a URL
 * @param {string} url The URL of the SVG file
 * @returns {Promise<SVGElement>} The loaded SVG element
 */
export async function loadSVG(url) {
    if (cache[url]) return cache[url];

    const parser = new DOMParser();

    const svgString = url.startsWith("data:image/svg+xml;base64,") ? atob(url.substring(26)) : await fetch(url).then(response => response.text());
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    return cache[url] = doc.getElementsByTagNameNS(SVG_NS, "svg").item(0);
}

/**
 * Convert an SVG element to an HTMLImageElement
 * @param {SVGElement} svgElement The SVG element to convert
 * @returns {Promise<HTMLImageElement>} The converted image
 */
export function SVGtoImage(svgElement) {
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
