import chai from 'ultimate-chai';
import sinon from 'sinon';

const { expect } = chai;

describe('CustomProtocolCoreClass', () => {
    function getInstanceWithRegisteredProtocol(id, protocol) {
        const instance = new CustomProtocolCoreClass({ onMessage: () => {} });
        CustomProtocolsIndex.TestProtocol = { id };
        if (!protocol) {
            instance._customProtocols[id] = {
                protocol: new class TestProtocol extends CustomProtocol {},
                messages: {},
                options: {}
            };
        } else {
            instance._customProtocols[id] = { protocol, messages: {}, options: {} };
        }
        return instance;
    }

    describe('#constructor()', () => {
        it('should register callback in direct stream', () => {
            const directStream = { onMessage: sinon.spy() };
            const instance = new CustomProtocolCoreClass(directStream);
            expect(directStream.onMessage).to.be.calledOnce();
        });
    });

    describe('#registerProtocol', () => {
        const directStream = { onMessage: () => {} };

        it('should throw if protocol is not an instance of CustomProtocol', () => {
            const instance = new CustomProtocolCoreClass(directStream);
            expect(instance.registerProtocol.bind(
                instance, 1, {}, new class FakeProtocol {})
            ).to.throw(
                CustomProtocolError, /Not a CustomProtocol instance/
            );
        });

        it('should throw if protocol id is already used', () => {
            const instance = getInstanceWithRegisteredProtocol(1);
            expect(instance.registerProtocol.bind(
                instance, 1, {}, new class TestProtocol extends CustomProtocol { }
            )).to.throw(CustomProtocolError, /id is already registered/);
        });
    });

    describe('#registerMessage', () => {
        it('should register message', () => {
            const instance = getInstanceWithRegisteredProtocol(1);
            const definition = { test: 'test' };
            instance.registerMessage(1, 2, definition);
            expect(instance._customProtocols[1].messages[2].id).to.be.equal(2);
            expect(instance._customProtocols[1].messages[2].definition).to.be.equal(definition);
            expect(instance._customProtocols[1].messages[2]._callbacks).to.have.lengthOf(0);
        });
    });

    describe('#registerCallback', () => {
        it('should register callback', () => {
            const instance = getInstanceWithRegisteredProtocol(1);
            function callback() {}
            instance._customProtocols[1].messages[1] = {
                id: 1,
                definition: {},
                _callbacks: []
            };
            instance.registerCallback(1, 1, callback);
            expect(instance._customProtocols[1].messages[1]._callbacks[0]).to.be.equal(callback);
        });

        it('should throw on unknown message id', () => {
            const instance = getInstanceWithRegisteredProtocol(1);
            expect(instance.registerCallback.bind(instance, 1, 1, () => {})).to.throw(
                CustomProtocolError,
                /Can not set callback for unknown messageId/
            );
        });

        describe('#removeCallback', () => {
            it('should remove callback', () => {
                const instance = getInstanceWithRegisteredProtocol(1);

                function callback() {
                }

                instance._customProtocols[1].messages[1] = {
                    id: 1,
                    definition: {},
                    _callbacks: []
                };
                const callback2 = callback.bind({tmp: 'tmp'});
                instance.registerCallback(1, 1, callback);
                instance.registerCallback(1, 1, callback2);
                expect(instance._customProtocols[1].messages[1]._callbacks).to.contain(callback);
                expect(instance._customProtocols[1].messages[1]._callbacks).to.contain(callback2);
                instance.removeCallback(1, 1, callback);
                expect(instance._customProtocols[1].messages[1]._callbacks).to.not.contain(callback);
                expect(instance._customProtocols[1].messages[1]._callbacks).to.contain(callback2);
                instance.removeCallback(1, 1, callback2);
            });
        });

        describe('#removeAllCallbacks', () => {
            it('should remove all callbacks', () => {
                const instance = getInstanceWithRegisteredProtocol(1);

                function callback() {
                }

                instance._customProtocols[1].messages[1] = {
                    id: 1,
                    definition: {},
                    _callbacks: []
                };
                const callback2 = callback.bind({tmp: 'tmp'});
                instance.registerCallback(1, 1, callback);
                instance.registerCallback(1, 1, callback2);
                expect(instance._customProtocols[1].messages[1]._callbacks).to.contain(callback);
                expect(instance._customProtocols[1].messages[1]._callbacks).to.contain(callback2);
                instance.removeAllCallbacks(1, 1);
                expect(instance._customProtocols[1].messages[1]._callbacks).to.not.contain(callback);
                expect(instance._customProtocols[1].messages[1]._callbacks).to.not.contain(callback2);
                expect(instance._customProtocols[1].messages[1]._callbacks.length).to.be.equal(0);
            });
        });
    });

    describe('#getHeader', () => {
        it('should return a proper header', () => {
            const protocolId = 5;
            const messageId = 1;
            const instance = getInstanceWithRegisteredProtocol(protocolId);
            instance._customProtocols[protocolId].messages[messageId] = {
                id: messageId,
                definition: {},
                _callbacks: []
            };
            const header = instance.getHeader(protocolId, messageId);
            expect(header.charCodeAt(0) >> 1).to.be.equal(protocolId);
            expect(header.charCodeAt(1)).to.be.equal(messageId);
        });
    });

    describe('#_fireMessageCallbacks', () => {
        it('should decode the message and fire callbacks', () => {
            const instance = getInstanceWithRegisteredProtocol(
                1,
                new class TestProtocol extends CustomProtocol {
                    decode(id, def, msg) { return msg; }
                }
            );
            instance._customProtocols[1].messages[1] = {
                id: 1,
                definition: {},
                _callbacks: []
            };
            const spy = sinon.spy();
            instance._customProtocols[1].messages[1]._callbacks.push(spy);
            const message = 'test';
            instance._fireMessageCallbacks(1, 1, 0, message);
            expect(spy).to.be.calledOnce();
            expect(spy).to.be.calledWith(message, 0);
        });
    });

    describe('#_messageHandler', () => {
        it('should warn on message from unknown protocol', () => {
            const instance = new CustomProtocolCoreClass({ onMessage: () => {} });
            const warn = sinon.spy(console, 'warn');
            instance._messageHandler({}, '', 0);
            expect(warn).to.be.calledWithMatch(/unknown custom protocol/);
            warn.restore();
        });
        it('should warn on unknown message', () => {
            const instance = getInstanceWithRegisteredProtocol(1);
            const warn = sinon.spy(console, 'warn');
            instance._messageHandler({}, String.fromCharCode(1 << 1, 1), 0);
            expect(warn).to.be.calledWithMatch(/unknown message/);
            warn.restore();
        });
        it('should call fireCallbacks', () => {
            const instance = getInstanceWithRegisteredProtocol(1);
            const spy = sinon.spy(instance, '_fireMessageCallbacks');
            instance._customProtocols[1].messages[1] = {
                id: 1,
                definition: {},
                _callbacks: []
            };
            instance._messageHandler(
                { preventCallingMeteorHandler: () => {} },
                String.fromCharCode(1 << 1, 1),
                0
            );
            expect(spy).to.be.calledOnce();
        });
        it('should call preventCallingMeteorHandler on directStream', () => {
            const instance = getInstanceWithRegisteredProtocol(1);
            instance._customProtocols[1].messages[1] = {
                id: 1,
                definition: {},
                _callbacks: []
            };
            const spy = sinon.spy();
            instance._messageHandler(
                { preventCallingMeteorHandler: spy },
                String.fromCharCode(1 << 1, 1),
                0
            );
            expect(spy).to.be.calledOnce();
        });
    });
});
