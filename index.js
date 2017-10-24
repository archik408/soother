
const { fakeXMLHttpRequest } = require('./lib/fakeAjax');
const { moduleSoother } = require('./lib/moduleSoother');

const Soother = require('./lib/soother');

// Mixin's
Soother.prototype.fakeXMLHttpRequest = fakeXMLHttpRequest;
Soother.prototype.moduleSoother = moduleSoother;

module.exports = new Soother();