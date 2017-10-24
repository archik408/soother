const Lab = require('lab');
const lab = Lab.script();
const { describe, it, expect } = lab;
const Soother = require('../');

describe('Module Soother:', () => {

    it('should provide possibility to mock and stub CommonJS modules', done => {

        const ms = Soother.moduleSoother();
        ms.mockModule('.\.css$', { test: 'test' });
        ms.stubModule('.\.svg$');

        const svg1 = require('./icon_1.svg');
        const svg2 = require('./icon_2.svg');

        const css1 = require('./styles_1.css');
        const css2 = require('./styles_2.css');

        expect(svg1).to.equal({});
        expect(svg2).to.equal({});

        expect(css1.test).to.equal('test');
        expect(css2.test).to.equal('test');

        done();
    });
});

module.exports = { lab };