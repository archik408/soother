const Lab = require('lab');
const lab = Lab.script();
const { describe, it, expect } = lab;
const Soother = require('../');


describe('Test Doubles:', () => {

    function createFunctionalSUT() {
        function SUT() {
            this.testProperty = 'test';
        }
        SUT.prototype.test = function (arg) {
            return arg;
        };
        return SUT;
    }
    function createClassSUT() {
        class SUT {
            constructor() {
                this.testProperty = 'test';
            }
            test(arg) {
                return arg;
            }
        }
        return SUT;
    }
    function createLiteralSUT() {
        return {
            testProperty: 'test',
            test: (arg) => {
                return arg;
            }
        };
    }
    function expectThatMethodWasReplacedByDummyFor(instance) {
        instance.test('test');
        const [firstCall] = instance.test.calls;
        const [argOfCall] = firstCall.args;
        expect(argOfCall).to.equal('test');
    }
    function expectThatWillBeReplacedByStubFor(instance) {
        const stubbedInstance = Soother.stub(instance);

        // Methods real and absent
        stubbedInstance.test();
        stubbedInstance.otherMethod();
        stubbedInstance.anyOther();

        stubbedInstance.test('test');
        stubbedInstance.otherMethod();
        stubbedInstance.anyOther();

        expect(stubbedInstance.test.calls.length).to.equal(2);
        expect(stubbedInstance.otherMethod.calls.length).to.equal(2);
        expect(stubbedInstance.anyOther.calls.length).to.equal(2);

        const [, methodCall] = stubbedInstance.test.calls;
        const [callArg] = methodCall.args;
        expect(callArg).to.equal('test');

        // Properties real and absent

        stubbedInstance.testProperty = 1;
        stubbedInstance.otherProp = 1;

        stubbedInstance.testProperty = 2;
        stubbedInstance.otherProp = 2;

        expect(stubbedInstance.testProperty.calls.length).to.equal(2);
        expect(stubbedInstance.otherProp.calls.length).to.equal(2);

        const [, propCall] = stubbedInstance.testProperty.calls;
        expect(propCall.value).to.equal(2);

    }
    function expectThatWillBeReplacedByMockFor(instance) {
        let mockInstance = Soother.mock(instance, {
            test: () => 'mock'
        });
        mockInstance.testProperty = 1;
        expect(mockInstance.test()).to.equal('mock');
        expect(mockInstance.testProperty.calls.length).to.equal(1);

        mockInstance = Soother.mock(instance, {
            testProperty: 'mock'
        });
        expect(mockInstance.testProperty).to.equal('mock');
        mockInstance.test();
        expect(mockInstance.test.calls.length).to.equal(1);
    }

    function expectThatWillBeWrappedWithSpyFor(instance) {
        const spyInstance = Soother.spy(instance);
        spyInstance.test('spy');
        const prop = spyInstance.testProperty;
        expect(prop).to.equal('test');
        spyInstance.testProperty = 'spy';
        spyInstance.test = 'spy';

        const { sets, gets } = spyInstance.spied;
        const [firstSet] = sets;
        const [firstGet] = gets;
        expect(sets.length).to.equal(2);
        expect(gets.length).to.equal(2);
        expect(firstGet.type).to.equal('method');
        expect(firstGet.args.length).to.equal(3);
        expect(firstSet.testProperty).to.equal('spy');
    }

    describe('Dummy', () => {

        it('can replace object (function) instance method', done => {
            const SUT = createFunctionalSUT();
            const instance = new SUT();
            expect(instance.test('test')).to.equal('test');
            instance.test = Soother.dummy();
            expectThatMethodWasReplacedByDummyFor(instance);
            done();
        });

        it('can replace object (class) instance method', done => {
            const SUT = createClassSUT();
            const instance = new SUT();
            expect(instance.test('test')).to.equal('test');
            instance.test = Soother.dummy();
            expectThatMethodWasReplacedByDummyFor(instance);
            done();
        });

        it('can replace prototype (function) method', done => {
            const SUT = createFunctionalSUT();
            SUT.prototype.test = Soother.dummy();
            const instance = new SUT();
            expectThatMethodWasReplacedByDummyFor(instance);
            done();
        });

        it('can replace prototype (class) method', done => {
            const SUT = createFunctionalSUT();
            SUT.prototype.test = Soother.dummy();
            const instance = new SUT();
            expectThatMethodWasReplacedByDummyFor(instance);
            done();
        });

        it('can replace literal object property function', done => {
            const SUT = createLiteralSUT();
            expect(SUT.test('test')).to.equal('test');
            SUT.test = Soother.dummy();
            expectThatMethodWasReplacedByDummyFor(SUT);
            done();
        });
    });

    describe('Stub', () => {
        it('can replace object (function) instance by stub', done => {
            const SUT = createFunctionalSUT();
            const instance = new SUT();
            expect(instance.test('test')).to.equal('test');
            expectThatWillBeReplacedByStubFor(instance);
            done();
        });
        it('can replace object (class) instance by stub', done => {
            const SUT = createClassSUT();
            const instance = new SUT();
            expect(instance.test('test')).to.equal('test');
            expectThatWillBeReplacedByStubFor(instance);
            done();
        });
        it('can replace object (literal) instance by stub', done => {
            const SUT = createLiteralSUT();
            expect(SUT.test('test')).to.equal('test');
            expectThatWillBeReplacedByStubFor(SUT);
            done();
        });
    });

    describe('Mock', () => {
        it('can replace object (function) instance by mock with test implementation', done => {
            const SUT = createFunctionalSUT();
            const instance = new SUT();
            expectThatWillBeReplacedByMockFor(instance);
            done();
        });
        it('can replace object (class) instance by mock with test implementation', done => {
            const SUT = createClassSUT();
            const instance = new SUT();
            expectThatWillBeReplacedByMockFor(instance);
            done();
        });
        it('can replace object (literal) instance by mock with test implementation', done => {
            const SUT = createLiteralSUT();
            expectThatWillBeReplacedByMockFor(SUT);
            done();
        });
    });

    describe('Spy', () => {
        it('can wrap object (function) instance with spy and record all actions', done => {
            const SUT = createFunctionalSUT();
            const instance = new SUT();
            expectThatWillBeWrappedWithSpyFor(instance);
            done();
        });
        it('can wrap object (class) instance with spy and record all actions', done => {
            const SUT = createClassSUT();
            const instance = new SUT();
            expectThatWillBeWrappedWithSpyFor(instance);
            done();
        });
        it('can wrap object (literal) instance with spy and record all actions', done => {
            const SUT = createLiteralSUT();
            expectThatWillBeWrappedWithSpyFor(SUT);
            done();
        });
    });

});

module.exports = { lab };