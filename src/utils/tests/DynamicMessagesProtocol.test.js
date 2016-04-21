const expect = chai.expect;

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
        });
    });
});
