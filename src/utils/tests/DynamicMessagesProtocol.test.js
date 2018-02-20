import chai from 'ultimate-chai';
import sinon from 'sinon';

const { expect } = chai;

describe('DynamicMessagesProtocol', () => {
    describe('#constructor', () => {
        it('should throw on direct construct', () => {
            CustomProtocolsIndex.DynamicMessagesProtocol = { id: 1 };
            let thrown = false;
            try {
                const instance = new DynamicMessagesProtocol();
            } catch (e) {
                thrown = true;
                expect(e).to.be.instanceOf(TypeError);
                expect(e.message).to.match(/abstract/);
            }
            expect(thrown).to.be.true();
            CustomProtocolCore._customProtocols = {};
        });
        // Will fail on second run on server.
        it('should register itself on message with id 0', () => {
            CustomProtocolsIndex.TestProtocol = { id: 8 };
            const stub = sinon.stub(CustomProtocolCommon.prototype, 'on');
            const TestProtocol = class TestProtocol extends DynamicMessagesProtocol {
                constructor() { super('TestProtocol'); }
                encode() {}
                decode() {}
            };
            const instance = new TestProtocol();
            expect(stub).to.be.calledOnce();
            expect(stub).to.be.calledWith(0, sinon.match.func);
            stub.restore();
            CustomProtocolCore._customProtocols = {};
        });
    });
    describe('#on', () => {
        it('should register a callback', () => {
            CustomProtocolsIndex.TestProtocol = { id: 1 };
            const TestProtocol = class TestProtocol extends DynamicMessagesProtocol {
                constructor() { super('TestProtocol'); }
                encode() {}
                decode() {}
            };
            const protocol = new TestProtocol();
            const cb = () => {};
            protocol.on('test', cb);
            expect(protocol._callbacks).to.have.property('test');
            expect(protocol._callbacks.test).to.contain(cb);
            CustomProtocolCore._customProtocols = {};
        });
    });
    describe('#removeCallback', () => {
        it('should remove a callback', () => {
            CustomProtocolsIndex.TestProtocol = { id: 1 };
            const TestProtocol = class TestProtocol extends DynamicMessagesProtocol {
                constructor() { super('TestProtocol'); }
                encode() {}
                decode() {}
            };
            const protocol = new TestProtocol();
            const cb = () => {};
            const cb2 = () => {};
            protocol.on('test', cb);
            protocol.on('test', cb2);
            expect(protocol._callbacks.test).to.contain(cb);
            expect(protocol._callbacks.test).to.contain(cb2);
            protocol.removeCallback('test', cb);
            expect(protocol._callbacks.test).to.not.contain(cb);
            expect(protocol._callbacks.test).to.contain(cb2);
            CustomProtocolCore._customProtocols = {};
        });
    });
    describe('#removeAllCallbacks', () => {
        it('should remove all callbacks', () => {
            CustomProtocolsIndex.TestProtocol = { id: 1 };
            const TestProtocol = class TestProtocol extends DynamicMessagesProtocol {
                constructor() { super('TestProtocol'); }
                encode() {}
                decode() {}
            };
            const protocol = new TestProtocol();
            const cb = () => {};
            const cb2 = () => {};
            protocol.on('test', cb);
            protocol.on('test', cb2);
            expect(protocol._callbacks.test).to.contain(cb);
            expect(protocol._callbacks.test).to.contain(cb2);
            protocol.removeAllCallbacks('test');
            expect(protocol._callbacks.test).to.be.undefined();
            CustomProtocolCore._customProtocols = {};
        });
    });
});
