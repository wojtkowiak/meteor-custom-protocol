import chai from 'ultimate-chai';
import sinon from 'sinon';

const { expect } = chai;

describe('CustomProtocol', () => {
    describe('#send', () => {
        it('should call directStream\'s send method with encoded message', () => {
            CustomProtocolsIndex.TestProtocol = { id: 3 };
            const instance = new (class TestProtocol extends CustomProtocol {})();
            const stub = sinon.stub(instance, 'getEncodedMessage');
            stub.returns('testmessage');
            const sendStub = sinon.stub(Meteor.directStream, 'send');
            instance.send(0, 'test');
            expect(sendStub).to.be.calledOnce();
            expect(sendStub).to.be.calledWith('testmessage');
            stub.restore();
            sendStub.restore();
        });
    });
});
