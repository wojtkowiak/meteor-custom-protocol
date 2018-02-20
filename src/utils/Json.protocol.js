let instance;
/**
 * A simple implementation of a JSON based protocol.
 * Since every protocol file gets its unique id at build time, we can not let this be instantiated
 * more than once.
 *
 * @extends DynamicMessagesProtocol
 * @category PROTOCOLS
 * @type {JsonProtocol}
 */
JsonProtocol = class JsonProtocol extends DynamicMessagesProtocol {
    constructor() {
        if (instance) throw new Error('JsonProtocol is a singleton.');
        super('JsonProtocol');
        instance = this;
    }

    /**
     * Returns the instance of JsonProtocol.
     *
     * @returns {JsonProtocol}
     */
    static getInstance() {
        if (instance) return instance;
        instance = new JsonProtocol();
        return instance;
    }

    /**
     * Encodes the message in JSON string.
     *
     * @param {number} messageId  - Message id, always 0 zero for dynamic messages protocols.
     * @param {Object} definition - Message definition object.
     * @param {Object=} payload   - Object with data.
     *
     * @returns {string}
     */
    encode(messageId, definition, payload = {}) {
        return JSON.stringify(payload);
    }

    /**
     * Decodes the JSON string to a standard JS object.
     *
     * @param {number} messageId  - Message id, always 0 zero for dynamic messages protocols.
     * @param {Object} definition - Message definition object.
     * @param {string} rawMessage - Message string as it arrived on the socket.
     *
     * @returns {Object}
     */
    decode(messageId, definiton, rawMessage) {
        return JSON.parse(rawMessage);
    }
};
