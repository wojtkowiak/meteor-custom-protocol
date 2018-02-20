/**
 * Custom protocol server side API.
 *
 * @category CLIENT
 * @extends CustomProtocolCommon
 * @type {CustomProtocol}
 */
CustomProtocol = class CustomProtocol extends CustomProtocolCommon {
    /**
     * Encodes and sends the message to specified session ids.
     *
     * @param {number}       messageId  - Id of the message.
     * @param {Array}        payload    - Array of data that the message should carry.
     * @param {Array|string} sessionIds - Session id or an array of it.
     * @param {boolean}      deferred   - Specifies whether to defer the sending in the loop.
     */
    send(messageId, payload, sessionIds = [], deferred = false) {
        const message = this.getEncodedMessage(messageId, payload);
        const sessionIdsToSendTo = Array.isArray(sessionIds) ? sessionIds : [sessionIds];
        if (!deferred) {
            sessionIdsToSendTo.forEach(sessionId => Meteor.directStream.send(message, sessionId));
        } else {
            sessionIdsToSendTo.forEach(sessionId =>
                Meteor.defer(() => Meteor.directStream.send(message, sessionId)));
        }
    }
};
