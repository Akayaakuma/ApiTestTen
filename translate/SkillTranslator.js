const BaseTranslator = require("./BaseTranslator");

class SkillTranslator extends BaseTranslator {
    constructor(className) {
        super(`Skills.${className}`);
    }
}

module.exports = SkillTranslator;