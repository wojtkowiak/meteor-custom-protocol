const expect = chai.expect;

describe('JsonProtocol', () => {
    describe('#send', () => {
        // Will fail on second run.
        it('should be singleton', () => {
            CustomProtocolsIndex.TestProtocol = { id: 3 };
            const Protocol = class TestProtocol extends JsonProtocol {
            };
            const instance1 = new Protocol();
            let thrown = false;
            try {
                const instance2 = new Protocol();
            } catch (e) {
                thrown = true;
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.match(/singleton/);
            }
            expect(thrown).to.be.true();
        });
    });
});