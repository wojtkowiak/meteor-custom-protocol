/**
 * Custom protocol client side API.
 *
 * @category CLIENT
 * @extends CustomProtocolCommon
 * @type {CustomProtocol}
 */
CustomProtocol = class CustomProtocol extends CustomProtocolCommon {

    /**
     * Encodes and send the message to the server.
     *
     * @param {number} messageId - Id of the message.
     * @param {Array}  payload   - Array of data that the message should carry.
     */
    send(messageId, payload) {
        Meteor.directStream.send(this.getEncodedMessage(messageId, payload));
    }

};
