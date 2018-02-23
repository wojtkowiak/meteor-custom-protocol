/**
 * Custom protocol client side API.
 *
 * @category CLIENT
 * @extends CustomProtocolCommon
 * @type {CustomProtocol}
 */
CustomProtocol = class CustomProtocol extends CustomProtocolCommon {
    /**
     * Register a custom connection from `DDP.connect`.
     *
     * @param {Object=} connection   - Reference to DDP connection object.
     *
     * @returns {Symbol} Id of the additional DDP connection.
     */
    registerConnection(connection) {
        return Meteor.directStream.registerConnection(connection);
    }

    /**
     * Encodes and send the message to the server.
     *
     * @param {number}        messageId  - Id of the message.
     * @param {Array}         payload    - Array of data that the message should carry.
     * @param {Object}        connection - DDP connection instance.
     *
     */
    send(messageId, payload, connection) {
        Meteor.directStream.send(this.getEncodedMessage(messageId, payload), connection);
    }
};
