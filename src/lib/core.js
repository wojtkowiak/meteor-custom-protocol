/* eslint-disable no-console */

/**
 * The core of custom protocol package. Handles the messages that come to the socket.
 * The class checks what protocol should handle the message, calls the protocol's `decode` method
 * and fires callbacks.
 *
 * @category INTERNALS
 * @type {CustomProtocolCoreClass}
 */
CustomProtocolCoreClass = class CustomProtocolCoreClass {
    constructor(directStream) {
        const self = this;
        this._customProtocols = {};
        // Register handler for hooking up to the Meteor server. All incoming socket messages
        // will now go through thisd class first.
        directStream.onMessage(function messageHandler(...params) {
            self._messageHandler(this, ...params);
        });
    }

    /**
     * Checks if the message is a DDP or a custom protocol's message. Fires callbacks and prevents
     * Meteor from handling the message.
     *
     * @param {Object}  directStream - Reference to directStream object.
     * @param {string}  message      - Raw message.
     * @param {string}  sessionId    - Meteor's internal session id.
     * @param {string=} userId       - User id if available.
     * @param {Symbol=} connectionId - Id of the additional DDP connection.
     * @param {Object=} connection   - Reference to DDP connection object.

     * @private
     */
    _messageHandler(directStream, message, sessionId, userId, connectionId, connection) {
        if (!(message.charCodeAt(0) & 1)) {
            const protocolId = message.charCodeAt(0) >> 1;
            const messageId = message.charCodeAt(1);
            if (!this._customProtocols[protocolId]) {
                console.warn(`Received a message for unknown custom protocol: ${protocolId}. ` +
                    `The message was: ${message}`);
            } else if (!this._customProtocols[protocolId].messages[messageId]) {
                console.warn(`Received an unknown message (id: ${messageId}) for custom ` +
                    `protocol: ${protocolId}. The message was: ${message}`);
            } else {
                this._fireMessageCallbacks(
                    protocolId, messageId,
                    sessionId, message.substr(2),
                    userId, connectionId, connection
                );
                directStream.preventCallingMeteorHandler();
            }
        }
    }

    /**
     * Decodes the message and fires callbacks.
     *
     * @param {number}  protocolId   - Id of the protocol.
     * @param {number}  messageId    - Id of the message.
     * @param {string}  sessionId    - Meteor's internal session id.
     * @param {string}  rawMessage   - The message as it arrived on the socket.
     * @param {string=} userId       - User id if available.
     * @param {Symbol=} connectionId - Id of the additional DDP connection.
     * @param {Object=} connection   - Reference to DDP connection object.

     * @private
     */
    _fireMessageCallbacks(
        protocolId, messageId,
        sessionId, rawMessage,
        userId, connectionId, connection
    ) {
        const callbacks = this._customProtocols[protocolId].messages[messageId]._callbacks;
        if (!callbacks.length) return;
        const message = this._customProtocols[protocolId].protocol.decode(
            messageId,
            this.getDefinition(protocolId, messageId),
            rawMessage
        );
        callbacks.forEach(callback =>
            callback(message, sessionId, userId, connectionId, connection));
    }

    /**
     * Registers a custom protocol. Just stores the protocol id and reference to the class
     * in an array.
     *
     * @param {number}         protocolId - Unique number representing the protocol.
     * @param {Object}         options    - Options object.
     * @param {CustomProtocol} protocol   - Instance of a class extending the CustomProtocol.
     *
     * @throws {CustomProtocolError} Will throw an error when protocolId was already used or when
     * the class instance is not a CustomProtocol instance.
     */
    registerProtocol(protocolId, options, protocol) {
        if (!(protocol instanceof CustomProtocol)) throw new CustomProtocolError(0, protocolId);
        if (this._customProtocols[protocolId]) throw new CustomProtocolError(1, protocolId);

        this._customProtocols[protocolId] = { protocol, messages: {}, options };
    }

    /**
     * Registers a message type for a specified protocol.
     *
     * @param {number} protocolId - Unique number representing the protocol.
     * @param {number} messageId  - Id of the message.
     * @param {Object} definition - Message definition object. Definition is a place to store
     * any info useful for encode/decode process.
     */
    registerMessage(protocolId, messageId, definition) {
        if (messageId > 255) {
            throw new Error('Message if can not be higher than 255.');
        }
        this._customProtocols[protocolId].messages[messageId] = {
            id: messageId,
            definition,
            _callbacks: []
        };
    }

    /**
     * Returns previously stored definition.
     *
     * @param {number} protocolId - Unique number representing the protocol.
     * @param {number} messageId  - Id of the message.
     * @returns {Object|definition|{}}
     */
    getDefinition(protocolId, messageId) {
        return this._customProtocols[protocolId].messages[messageId].definition;
    }

    /**
     * Registers a callback for a specified message.
     *
     * @param {number} protocolId - Unique number representing the protocol.
     * @param {number} messageId  - Id of the message.
     * @param {Function} callback - Reference of the function to call when a message arrives.
     */
    registerCallback(protocolId, messageId, callback) {
        if (!this._customProtocols[protocolId].messages[messageId]) {
            throw new CustomProtocolError(2, protocolId, messageId);
        }
        this._customProtocols[protocolId].messages[messageId]._callbacks.push(callback);
    }

    /**
     * Removes a callback for a specified message.
     *
     * @param {number} protocolId - Unique number representing the protocol.
     * @param {number} messageId  - Id of the message.
     * @param {Function} callback - Reference of the function to call when a message arrives.
     */
    removeCallback(protocolId, messageId, callback = Function.prototype) {
        if (!this._customProtocols[protocolId].messages[messageId]) {
            return;
        }

        const index =
            this._customProtocols[protocolId].messages[messageId]._callbacks.indexOf(callback);
        if (~index) {
            this._customProtocols[protocolId].messages[messageId]._callbacks.splice(index, 1);
        }
    }

    /**
     * Removes all callbacks for a specified message.
     *
     * @param {number} protocolId - Unique number representing the protocol.
     * @param {number} messageId  - Id of the message.
     */
    removeAllCallbacks(protocolId, messageId) {
        if (!this._customProtocols[protocolId].messages[messageId]) {
            return;
        }

        this._customProtocols[protocolId].messages[messageId]._callbacks = [];
    }

    /**
     * Gets the 16 bit message header which consists of:
     * 0xxx xxx | yyyy yyyy
     * where x is the protocol id and y is the message id.
     *
     * TODO: check if message name is registered
     *
     * @param {number} protocolId - Unique number representing the protocol.
     * @param {number} messageId  - Id of the message.
     * @returns {string}
     */
    getHeader(protocolId, messageId) {
        return String.fromCharCode(
            protocolId << 1,
            this._customProtocols[protocolId].messages[messageId].id
        );
    }
};

CustomProtocolCore = new CustomProtocolCoreClass(Meteor.directStream);
