/**
 * Implementation of common logic for dynamic messages type protocols.
 *
 * @category PROTOCOLS
 * @extends CustomProtocol
 * @abstract
 * @type {DynamicMessagesProtocol}
 */
DynamicMessagesProtocol = class DynamicMessagesProtocol extends CustomProtocol {
    /**
     * @param {string} name - Class name of the protocol.
     */
    constructor(name) {
        super();
        if ((this.encode === undefined || typeof this.encode !== 'function') ||
            (this.decode === undefined || typeof this.decode !== 'function')) {
            throw new TypeError('Tried to construct an abstract class.');
        }
        // This kind of protocol must have a field in the message object that identifies the message
        // type.
        this.setTypeFieldName('__type');
        this.registerProtocol(name, {
            messagesDefinition: this.protocolTypes.DYNAMIC_MESSAGES
        });
        this._callbacks = {};

        super.on(0, this.processMessages.bind(this));
    }

    /**
     * Fires callbacks registered for a concrete type of message. The type of message is checked in
     * the message itself by checking the field with name specified with `this.setTypeFieldName`.
     *
     * @param {Object}  message       - Decoded message object.
     * @param {string}  sessionId     - Session id of sender.
     * @param {string=} userId        - User id if available.
     * @param {Symbol=} connectionId  - Id of the additional DDP connection.
     * @param {Object=} connection    - Reference to DDP connection object.
     *
     */
    processMessages(message, sessionId, userId, connectionId, connection) {
        if (this._callbacks[message[this._typeFieldName]]) {
            this._callbacks[message[this._typeFieldName]]
                .forEach(callback =>
                    callback(message, sessionId, userId, connectionId, connection));
        }
    }

    /**
     * Registers a callback for a specified message type.
     *
     * @param {string}                                 messageType - Message type.
     * @param {DynamicMessagesProtocol~messageHandler} callback    - Callback to fire.
     */
    on(messageType, callback) {
        if (!this._callbacks[messageType]) {
            this._callbacks[messageType] = [callback];
        } else {
            this._callbacks[messageType].push(callback);
        }
    }

    /**
     * Removes a callback for a specified message type.
     *
     * @param {string}                                 messageType - Message type.
     * @param {DynamicMessagesProtocol~messageHandler} callback    - Callback to remove.
     */
    removeCallback(messageType, callback = Function.prototype) {
        if (!this._callbacks[messageType]) {
            return;
        }

        const index = this._callbacks[messageType].indexOf(callback);
        if (~index) {
            this._callbacks[messageType].splice(index, 1);
        }
    }

    /**
     * Removes all callbacks for a specified message type.
     *
     * @param {string} messageType - Message type.
     */
    removeAllCallbacks(messageType) {
        if (!this._callbacks[messageType]) {
            return;
        }

        delete this._callbacks[messageType];
    }

    /**
     * Sends the specified message type with payload.
     *
     * @param {string} messageType         - Message type.
     * @param {Object} payload             - Object with the data.
     * @param {Array|string|Object} target - Server: session id or an array of it,
     *                                       client: ddp connection instance.
     * @param {boolean}      deferred      - Specifies whether to defer the sending in the loop.
     */
    send(messageType, payload, target, deferred = false) {
        if (payload[this._typeFieldName]) {
            throw new Error(`Field ${this._typeFieldName} would be overwritten. Change protocols ` +
                'type field name with setTypeField method.');
        }
        this._typeObject[this._typeFieldName] = messageType;
        super.send(0, _.extend(this._typeObject, payload), target, deferred);
    }
};

/**
 * @callback DynamicMessagesProtocol~messageHandler
 * @param {string}  message       - Message received on the socket.
 * @param {string=} sessionId     - Meteor's internal session id.
 * @param {string=} userId        - User id if available.
 * @param {Symbol=} connectionId  - Id of the additional DDP connection.
 * @param {Object=} connection    - Reference to DDP connection object.
 */
