if (![].toReversed)
    Array.prototype.toReversed = function () {
        const arr = [];
        for (let i = (this.length - 1); i >= 0; --i) arr.push(this[i]);
        return arr;
    };

if (!("structuredClone" in globalThis))
    globalThis.structuredClone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };
