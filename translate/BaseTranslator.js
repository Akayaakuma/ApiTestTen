const dictionary = require("./dictionary.json");

class BaseTranslator {

    static _dictionarySection;

    constructor(basePath = "") {
        this._dictionarySection = this._resolvePath(basePath, dictionary);
    }

    translate(string) {
        if (!(string in this._dictionarySection)) return string;
        return this._dictionarySection[string];
    }

    _resolvePath(path, dictionary) {
        if (path.length == 0) return dictionary;

        let parts = path.split(".");
        if (parts.length === 1) return dictionary[parts[0]];
        return this._resolvePath(parts.slice(1).join("."), dictionary[parts[0]]);
    }

}

module.exports = BaseTranslator;