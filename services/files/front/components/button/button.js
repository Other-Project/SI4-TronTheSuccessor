import {HTMLComponent} from "/js/component.js";

export class Button extends HTMLComponent {

    constructor() {
        super("button", ["html", "css"]);
        this._disabled = false;
    }

    onVisible = () => {
        if (this._disabled) this.updateDisabledState();
    };

    set disabled(value) {
        this._disabled = value;
        this.updateDisabledState();
    }

    updateDisabledState() {
        const button = this.shadowRoot.querySelector('button');
        if (button) button.disabled = this._disabled;
    }
}
