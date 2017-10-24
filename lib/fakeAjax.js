/**
 * Fake AJAX internal values
 *
 * @private
 * @type {Object}
 */
const fakeAjax = {
    calls: [],
    headers: {},
    methods: {},
    mimeType: {},
    options: {}
};

/**
 * Fake XMLHttpRequest interface implementation
 *
 * {@link https://xhr.spec.whatwg.org/#xmlhttprequest}
 */
class FakeXMLHttpRequest {
    constructor() {
        this.timeout = fakeAjax.options.timeout || null;
        this.status = fakeAjax.options.status || 200;
        this.statusText = fakeAjax.options.statusText || 'OK';
        this.responseXML = fakeAjax.options.responseXML || '<xml></xml>';
        this.readyState = fakeAjax.options.readyState || 4; // DONE by default
        this.responseText = fakeAjax.options.responseText || '';
    }
    abort() {
        //do nothing
    }
    getAllResponseHeaders() {
        return null; // "";
    }
    getResponseHeader(headerName) {
        return fakeAjax.headers[headerName] || null;
    }
    open(method, url, async, user, password) {
        fakeAjax.calls.push({
            method: method, url: url, async: async, user: user, password: password
        });
    }
    send(data){
        if (fakeAjax.calls.length) {
            const lastIndex = fakeAjax.calls.length - 1;
            const lastCall = fakeAjax.calls[lastIndex];

            lastCall.data = data;
            const verbHandlers = _fetchVerbHandlers(lastCall.method);

            const expressions = Object.keys(verbHandlers);
            for (const key in expressions) {
                const re = expressions[key];
                if (new RegExp(re, 'g').test(lastCall.url)) {
                    this.responseText = verbHandlers[re];

                    if (this.onreadystatechange && typeof this.onreadystatechange === 'function') {
                        this.onreadystatechange(this.responseText);
                    }

                    return this.responseText;
                }
            }
        }
    }
    setRequestHeader(header, value){
        fakeAjax.headers[header] = value;
    }
    overrideMimeType(type){
        return fakeAjax.mimeType = type;
    }
}

/**
 * Set default fake internal values
 *
 * @private
 * @returns {void}
 */
function _clearInternals() {
    fakeAjax.calls = [];
    fakeAjax.headers = {};
    fakeAjax.methods = {};
    fakeAjax.mimeType = {};
    fakeAjax.options = {};
}

/**
 * Fetch from fake internal registered handlers for specific HTTP-method
 *
 * @param {String} method - HTTP-method (verb) name
 * @private
 * @returns {Object} Verb handlers that associate with HTTP-method
 */
function _fetchVerbHandlers(method) {
    const verb = `${method}`.toUpperCase();
    if (!fakeAjax.methods[verb]) fakeAjax.methods[verb] = {};
    return fakeAjax.methods[verb];
}

/**
 * Set AJAX implementation and setup default fake internals
 *
 * @param {Object} impl - XMLHttpRequest implementation
 * @private
 * @returns {void}
 */
function _setAjaxImpl(impl) {
    // Browser's (or jsdom)
    if (window && window.XMLHttpRequest) {
        window.XMLHttpRequest = impl;
    }
    // Node.js (no sense)
    else if (global && global.XMLHttpRequest) {
        global.XMLHttpRequest = impl;
    }
    // eslint-disable-next-line
    XMLHttpRequest = impl;
    _clearInternals();
}

/**
 * Replace standard XMLHttpRequest by fake implementation
 *
 * @returns {Object} Functions for configuring fake
 */
function fakeXMLHttpRequest(options = {}) {
    // Browser's (or jsdom)
    const winAjax = window && window.XMLHttpRequest;
    // Node.js (no sense)
    const gloAjax = global && global.XMLHttpRequest;
    const origAjaxObj = winAjax || gloAjax || XMLHttpRequest;

    fakeAjax.options = options;

    _setAjaxImpl(FakeXMLHttpRequest);

    return {
        calls: () => fakeAjax.calls,
        headers: () => fakeAjax.headers,
        methods: () => fakeAjax.methods,
        restore: () => {
            _setAjaxImpl(origAjaxObj);
        },
        register: (method, url, data) => {
            const verbHandlers = _fetchVerbHandlers(method);
            verbHandlers[url] = data;
        }
    };
}

module.exports = { fakeXMLHttpRequest };