/**
 * Service that create CommonJS module stubs and mocks
 *
 * @return {Object} Object literal that contain service methods
 */
function moduleSoother() {
    let Module = {};
    try {
        Module = require('module');
    } finally {
        const originalRequire = Module.prototype.require;
        let modules = {};

        Module.prototype.require = function(moduleName){
            const expressions = Object.keys(modules);
            for (const key in expressions) {
                const re = expressions[key];
                if (new RegExp(re, 'g').test(moduleName)) {
                    return modules[re];
                }
            }

            return Reflect.apply(originalRequire, this, arguments);
        };

        return {
            restore: (name) => {
                if (name) {
                    modules[name] = undefined;
                }
                modules = {};
            },
            stubModule: (re) => {
                if (re) {
                    modules[re] = {};
                }
            },
            mockModule: (re, impl) => {
                if (re) {
                    modules[re] = impl;
                }
            }
        };
    }
}

module.exports = { moduleSoother };