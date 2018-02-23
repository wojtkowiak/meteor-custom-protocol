/**
 * This is a base class that stores common methods for both client & server implementation.
 * It acts as a interface to the CustomProtocolCore class where the main logic happens.
 *
 * @abstract
 * @category INTERNALS
 * @type {CustomProtocolCommon}
 */
CustomProtocolCommon = class CustomProtocolCommon {
    constructor() {
        this._messages = [];
        this._typeFieldName = null;
        this._typeObject = {};

        /**
         * There are two types of protocols. Those with messages declared explicitly in the class
         * constructor and those which allow to register messages dynamically at any time.
         *
         * @enum {number}
         */
        this.protocolTypes = {
            DECLARED_MESSAGES: 1,
            DYNAMIC_MESSAGES: 2
        };

        this._options = {
            messagesDefinition: this.protocolTypes.DECLARED_MESSAGES
        };
    }

    /**
     * For protocols with dynamic messages sets the field name that holds the message type.
     *
     * @param {string} name - Name of the field in the message object.
     */
    setTypeFieldName(name) {
        this._typeFieldName = name;
        this._typeObject = {};
        this._typeObject[name] = '';
    }

    /**
     * Registers the protocol in core class.
     *
     * @param {string} name    - Class name of the protocol.
     * @param {Object} options - An object with the protocol config.
     */
    registerProtocol(name, options = {}) {
        if (!CustomProtocolsIndex[name]) {
            throw new Error(`Protocol ${name} did not receive unique id. Check if the file name is `
                + 'in format `<name>.protocol.js` so that the indexer can assign an id to it.');
        }
        this._id = CustomProtocolsIndex[name].id;

        if (this._id > 127) {
            throw new Error('Custom protocol must have an this._id lower than 127');
        }

        _.extend(this._options, options);

        CustomProtocolCore.registerProtocol(this._id, this._options, this);

        this.registerMessages();
        if (
            options &&
            options.messagesDefinition === this.protocolTypes.DYNAMIC_MESSAGES
        ) {
            this.registerMessage(0);
        }
    }

    /**
     * Registers all the declared messages and their definitions in core class.
     */
    registerMessages() {
        if (this._messages.length > 0) {
            // noinspection JSAnnotator
            for (const [messageId, definition] of this._messages.entries()) {
                if (definition !== undefined) {
                    CustomProtocolCore.registerMessage(this._id, messageId, definition);
                }
            }
        }
    }

    /**
     * Registers a single message.
     *
     * @param {number} messageId  - Unique id of the message.
     * @param {Object} definition - Object with the message definition.
     */
    registerMessage(messageId, definition = {}) {
        CustomProtocolCore.registerMessage(this._id, messageId, definition);
    }

    /**
     * Registers a callback for a specified message.
     *
     * @param {number}   messageId - Id of the message.
     * @param {callback} callback  - Function that will receive the message payload.
     */
    on(messageId, callback) {
        CustomProtocolCore.registerCallback(this._id, messageId, callback);
    }

    /**
     * Removes a callback for a specified message.
     *
     * @param {number} messageId  - Id of the message.
     * @param {Function} callback - Reference of the function to call when a message arrives.
     */
    removeCallback(messageId, callback = Function.prototype) {
        CustomProtocolCore.removeCallback(this._id, messageId, callback);
    }

    /**
     * Removes all callbacks for a specified message.
     *
     * @param {number} messageId  - Id of the message.
     */
    removeAllCallbacks(messageId) {
        CustomProtocolCore.removeAllCallbacks(this._id, messageId);
    }

    /**
     * Computes the message string by concatenating header and encoded message payload.
     *
     * @param {number} messageId - Id of the message.
     * @param {Array}  payload   - An array with message payload.
     * @returns {string}
     */
    getEncodedMessage(messageId, payload = []) {
        let message = null;
        // Get the 16 bit header.
        message = CustomProtocolCore.getHeader(this._id, messageId);
        message += this.encode(
            messageId,
            CustomProtocolCore.getDefinition(this._id, messageId),
            ...(!Array.isArray(payload) ? [payload] : payload)
        );
        return message;
    }
};
