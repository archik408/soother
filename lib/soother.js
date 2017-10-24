/**
 * Soother. Factory for creating dummies, stubs, mocks and spies
 */
class Soother {
    /**
     * A minimal function is which does nothing and returns nothing.
     *
     * @returns {Function} Dummy function / method
     */
    dummy() {
        const dummyFunc = (...args) => {
            dummyFunc.calls.push({ args });
        };
        dummyFunc.calls = [];
        return dummyFunc;
    }
    /**
     * Stub properties and methods in object.
     * By default create object literal with dummy properties
     *
     * @param {Object} [object] - Target object, optional
     * @returns {Proxy} Target object with stubbed method['s]
     */
    stub(object = {}) {
        const internals = {};
        const returnDummy = (name) => {
            if (!internals[name]) internals[name] = this.dummy();
            return internals[name];
        };
        const setDummy = (name, value) => {
            if (!internals[name]) internals[name] = { calls: [] };
            internals[name].calls.push({ value })
        };
        return new Proxy(object, {
            set: (target, name, value) => setDummy(name, value),
            get: (target, name) => returnDummy(name)
        });
    }
    /**
     * Create mock of specific method in object or all methods.
     * By default create stub empty object
     *
     * @param {Object} [object] - Target object, optional
     * @param {Object} [fakeMethods] - Method map with fake implementations, optional
     * @returns {Proxy} Target object with stubbed method['s]
     */
    mock(object = {}, fakeMethods) {
        return new Proxy(this.stub(object), {
            get: (target, name) => {
                if (fakeMethods[name]) {
                    return fakeMethods[name];
                }
                return target[name];
            }
        });
    }
    /**
     * Create spy for specific object.
     * By default create empty object
     *
     * @param {Object} [object] - Target object, optional
     * @returns {Proxy} Wrapped Target object with spy
     */
    spy(object = {}) {
        const internals = {
            sets: [],
            gets: []
        };
        return new Proxy(object, {
            set: (target, name, value) => {
                internals.sets.push({ [name]: value });
                target[name] = value;
            },
            get: (target, name) => {
                if (name === 'spied') {
                    return internals;
                }
                if (typeof target[name] === 'function') {
                    return (args) => {
                        internals.gets.push({ type: 'method', args });
                        return target[name](args);
                    }
                }
                internals.gets.push({ type: 'property', [name] : target[name] });
                return target[name];
            }
        });
    }
}

module.exports = Soother;