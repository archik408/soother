const Lab = require('lab');
const lab = Lab.script();
const { describe, it, expect } = lab;
const Soother = require('../');

require('babel-register')();
const { jsdom } = require('jsdom');

const exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;

Object.keys(document.defaultView).forEach((property) => {
    if (typeof global[property] === 'undefined') {
        exposedProperties.push(property);
        global[property] = document.defaultView[property];
    }
});

if (typeof global.Node === 'undefined') {
    global.Node = document.defaultView.Node;
}

global.navigator = {
    userAgent: 'node.js'
};

documentRef = document;


describe('Fake XMLHttpRequest:', () => {

    it('should contain fake implementation of GET method', done => {
        const url = 'http://www.test.org/test.txt';
        const fake = Soother.fakeXMLHttpRequest();
        fake.register('get', url, '{data:"test"}');


        const oReq = new XMLHttpRequest();
        oReq.onreadystatechange = () => {
            expect(oReq.responseText).to.equal('{data:"test"}');
        };
        oReq.open('GET', url);
        oReq.setRequestHeader('Content-Type', 'text/html; charset=utf-8');
        oReq.overrideMimeType('text/plain; charset=x-user-defined');
        oReq.abort();
        oReq.send('{data:"test"}');

        expect(oReq.getAllResponseHeaders()).to.equal(null);
        expect(oReq.getResponseHeader('Content-Type')).to.equal('text/html; charset=utf-8');
        expect(oReq.getAllResponseHeaders()).to.equal(null);

        const [firstCall] = fake.calls();
        expect(firstCall.method).to.equal('GET');
        expect(firstCall.url).to.equal('http://www.test.org/test.txt');
        expect(firstCall.data).to.equal('{data:"test"}');

        const methods = fake.methods();
        expect(methods.GET[url]).to.equal('{data:"test"}');

        done();
    });
});

module.exports = { lab };
