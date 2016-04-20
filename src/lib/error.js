/**
 * Simple error class.
 *
 * @category INTERNALS
 * @type {CustomProtocolError}
 */
CustomProtocolError = class CustomProtocolError extends Error {
    constructor(id, ...params) {
        super();
        this._messages = [
            `Not a CustomProtocol instance. (protocol id ${params[0]})`,
            `A custom protocol with this id is already registered. (protocol id ${params[0]})`,
            `Can not set callback for unknown messageId '${params[1]}' in protocol ${params[0]}.`
        ];
        this.name = 'CustomProtocolError';
        this.message = this._messages[id];
        this.id = id;
    }
};
