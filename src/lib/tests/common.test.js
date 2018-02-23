import chai from 'ultimate-chai';
import sinon from 'sinon';

const { expect } = chai;

describe('CustomProtocolCommon', () => {
    describe('#constructor()', () => {
        let instance;
        beforeEach(() => {
            CustomProtocolsIndex.TestProtocol = { id: 3 };
            instance = new (class TestProtocol extends CustomProtocolCommon {})();
        });
        it('should set default options', () => {
            expect(instance._options.messagesDefinition)
                .to.be.equal(instance.protocolTypes.DECLARED_MESSAGES);
        });
    });
    describe('#registerProtocol', () => {
        let instance;
        let stub;
        beforeEach(() => {
            CustomProtocolsIndex.TestProtocol = { id: 3 };
            instance = new (class TestProtocol extends CustomProtocolCommon {})();
            stub = sinon.stub(CustomProtocolCore, 'registerProtocol');
        });
        it('should register protocol in core', () => {
            instance.registerProtocol('TestProtocol');
            expect(stub).to.be.calledOnce();
            expect(stub).to.be.calledWith(3, sinon.match.object, instance);
        });
        it('should thrown on id > 127', () => {
            CustomProtocolsIndex.TestProtocol = { id: 128 };
            instance = new (class TestProtocol extends CustomProtocolCommon {})();
            expect(instance.registerProtocol.bind(instance, 'TestProtocol')).to.throw(Error, /lower than 127/);
        });
        it('should extend options', () => {
            const options = { testField: 'test' };
            instance.registerProtocol('TestProtocol', options);
            expect(instance._options.testField).to.be.equal(options.testField);
            expect(instance._options.messagesDefinition)
                .to.be.equal(instance.protocolTypes.DECLARED_MESSAGES);
        });
        it('should register message when protocol has dynamic messages', () => {
            const options = {
                messagesDefinition: instance.protocolTypes.DYNAMIC_MESSAGES
            };
            const registerMessageStub = sinon.stub(instance, 'registerMessage');
            instance.registerProtocol('TestProtocol', options);
            expect(registerMessageStub).to.be.calledOnce();
            expect(registerMessageStub).to.be.calledWith(0);
        });
        afterEach(() => {
            stub.restore();
        });
    });
    describe('#registerMessages', () => {
        it('should register all messages in core', () => {
            CustomProtocolsIndex.TestProtocol = { id: 3 };
            const instance = new (class TestProtocol extends CustomProtocol {
                constructor() { super(); this.registerProtocol('TestProtocol'); }
            })();
            const stub = sinon.stub(CustomProtocolCore, 'registerMessage');
            instance._messages[1] = { field: 'test1' };
            instance._messages[2] = { field: 'test2' };
            instance.registerMessages();
            expect(stub).to.be.calledTwice();
            expect(stub.firstCall).to.be.calledWith(3, 1, sinon.match({ field: 'test1' }));
            expect(stub.secondCall).to.be.calledWith(3, 2, sinon.match({ field: 'test2' }));
            stub.restore();
        });
    });
    describe('#getEncodedMessage', () => {
        it('should get full message', () => {
            CustomProtocolsIndex.TestProtocol = { id: 3 };
            const instance = new (class TestProtocol extends CustomProtocolCommon {
                encode(msgId, def, ...payload) { if (payload[0] === 'test') return 'test'; return null; }
            })();
            const stub = sinon.stub(CustomProtocolCore, 'getHeader');
            stub.returns('header');
            const getDefinition = sinon.stub(CustomProtocolCore, 'getDefinition');
            getDefinition.returns({});
            expect(instance.getEncodedMessage(0, ['test'])).to.be.equal('headertest');
            stub.restore();
            getDefinition.restore();
        });
    });
});
