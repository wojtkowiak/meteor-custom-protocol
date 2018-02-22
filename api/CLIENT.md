<a name="CustomProtocol"></a>

### CustomProtocol : <code>[CustomProtocol](#CustomProtocol)</code>
Custom protocol client side API.

**Kind**: global class  
**Extends:** <code>[CustomProtocolCommon](#CustomProtocolCommon)</code>  
**Category**: CLIENT  

* [CustomProtocol](#CustomProtocol) : <code>[CustomProtocol](#CustomProtocol)</code>
    * [.protocolTypes](#CustomProtocolCommon+protocolTypes) : <code>enum</code>
    * [.registerConnection([connection])](#CustomProtocol+registerConnection) ⇒ <code>Symbol</code>
    * [.send(messageId, payload, connection)](#CustomProtocol+send)
    * [.setTypeFieldName(name)](#CustomProtocolCommon+setTypeFieldName)
    * [.registerProtocol(name, options)](#CustomProtocolCommon+registerProtocol)
    * [.registerMessages()](#CustomProtocolCommon+registerMessages)
    * [.registerMessage(messageId, definition)](#CustomProtocolCommon+registerMessage)
    * [.on(messageId, callback)](#CustomProtocolCommon+on)
    * [.removeCallback(messageId, callback)](#CustomProtocolCommon+removeCallback)
    * [.removeAllCallbacks(messageId)](#CustomProtocolCommon+removeAllCallbacks)
    * [.getEncodedMessage(messageId, payload)](#CustomProtocolCommon+getEncodedMessage) ⇒ <code>string</code>

<a name="CustomProtocolCommon+protocolTypes"></a>

#### customProtocol.protocolTypes : <code>enum</code>
There are two types of protocols. Those with messages declared explicitly in the class
constructor and those which allow to register messages dynamically at any time.

**Kind**: instance enum property of <code>[CustomProtocol](#CustomProtocol)</code>  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| DECLARED_MESSAGES | <code>number</code> | <code>1</code> | 
| DYNAMIC_MESSAGES | <code>number</code> | <code>2</code> | 

<a name="CustomProtocol+registerConnection"></a>

#### customProtocol.registerConnection([connection]) ⇒ <code>Symbol</code>
Register a custom connection from `DDP.connect`.

**Kind**: instance method of <code>[CustomProtocol](#CustomProtocol)</code>  
**Returns**: <code>Symbol</code> - Id of the additional DDP connection.  

| Param | Type | Description |
| --- | --- | --- |
| [connection] | <code>Object</code> | Reference to DDP connection object. |

<a name="CustomProtocol+send"></a>

#### customProtocol.send(messageId, payload, connection)
Encodes and send the message to the server.

**Kind**: instance method of <code>[CustomProtocol](#CustomProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messageId | <code>number</code> | Id of the message. |
| payload | <code>Array</code> | Array of data that the message should carry. |
| connection | <code>Object</code> | DDP connection instance. |

<a name="CustomProtocolCommon+setTypeFieldName"></a>

#### customProtocol.setTypeFieldName(name)
For protocols with dynamic messages sets the field name that holds the message type.

**Kind**: instance method of <code>[CustomProtocol](#CustomProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the field in the message object. |

<a name="CustomProtocolCommon+registerProtocol"></a>

#### customProtocol.registerProtocol(name, options)
Registers the protocol in core class.

**Kind**: instance method of <code>[CustomProtocol](#CustomProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Class name of the protocol. |
| options | <code>Object</code> | An object with the protocol config. |

<a name="CustomProtocolCommon+registerMessages"></a>

#### customProtocol.registerMessages()
Registers all the declared messages and their definitions in core class.

**Kind**: instance method of <code>[CustomProtocol](#CustomProtocol)</code>  
<a name="CustomProtocolCommon+registerMessage"></a>

#### customProtocol.registerMessage(messageId, definition)
Registers a single message.

**Kind**: instance method of <code>[CustomProtocol](#CustomProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messageId | <code>number</code> | Unique id of the message. |
| definition | <code>Object</code> | Object with the message definition. |

<a name="CustomProtocolCommon+on"></a>

#### customProtocol.on(messageId, callback)
Registers a callback for a specified message.

**Kind**: instance method of <code>[CustomProtocol](#CustomProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messageId | <code>number</code> | Id of the message. |
| callback | <code>callback</code> | Function that will receive the message payload. |

<a name="CustomProtocolCommon+removeCallback"></a>

#### customProtocol.removeCallback(messageId, callback)
Removes a callback for a specified message.

**Kind**: instance method of <code>[CustomProtocol](#CustomProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messageId | <code>number</code> | Id of the message. |
| callback | <code>function</code> | Reference of the function to call when a message arrives. |

<a name="CustomProtocolCommon+removeAllCallbacks"></a>

#### customProtocol.removeAllCallbacks(messageId)
Removes all callbacks for a specified message.

**Kind**: instance method of <code>[CustomProtocol](#CustomProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messageId | <code>number</code> | Id of the message. |

<a name="CustomProtocolCommon+getEncodedMessage"></a>

#### customProtocol.getEncodedMessage(messageId, payload) ⇒ <code>string</code>
Computes the message string by concatenating header and encoded message payload.

**Kind**: instance method of <code>[CustomProtocol](#CustomProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messageId | <code>number</code> | Id of the message. |
| payload | <code>Array</code> | An array with message payload. |

