<a name="DynamicMessagesProtocol"></a>

### *DynamicMessagesProtocol : <code>[DynamicMessagesProtocol](#DynamicMessagesProtocol)</code>*
Implementation of common logic for dynamic messages type protocols.

**Kind**: global abstract class  
**Extends:** <code>CustomProtocol</code>  
**Category**: PROTOCOLS  

* *[DynamicMessagesProtocol](#DynamicMessagesProtocol) : <code>[DynamicMessagesProtocol](#DynamicMessagesProtocol)</code>*
    * *[new DynamicMessagesProtocol(name)](#new_DynamicMessagesProtocol_new)*
    * _instance_
        * *[.processMessages(messageObject, sessionId)](#DynamicMessagesProtocol+processMessages)*
        * *[.on(messageType, callback)](#DynamicMessagesProtocol+on)*
        * *[.removeCallback(messageType, callback)](#DynamicMessagesProtocol+removeCallback)*
        * *[.removeAllCallbacks(messageType)](#DynamicMessagesProtocol+removeAllCallbacks)*
        * *[.send(messageType, payload, sessionIds, deferred)](#DynamicMessagesProtocol+send)*
    * _inner_
        * *[~messageHandler](#DynamicMessagesProtocol..messageHandler) : <code>function</code>*

<a name="new_DynamicMessagesProtocol_new"></a>

#### *new DynamicMessagesProtocol(name)*

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Class name of the protocol. |

<a name="DynamicMessagesProtocol+processMessages"></a>

#### *dynamicMessagesProtocol.processMessages(messageObject, sessionId)*
Fires callbacks registered for a concrete type of message. The type of message is checked inthe message itself by checking the field with name specified with `this.setTypeFieldName`.

**Kind**: instance method of <code>[DynamicMessagesProtocol](#DynamicMessagesProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messageObject | <code>Object</code> | Decoded message object. |
| sessionId | <code>string</code> | Session id of sender. |

<a name="DynamicMessagesProtocol+on"></a>

#### *dynamicMessagesProtocol.on(messageType, callback)*
Registers a callback for a specified message type.

**Kind**: instance method of <code>[DynamicMessagesProtocol](#DynamicMessagesProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messageType | <code>string</code> | Message type. |
| callback | <code>[messageHandler](#DynamicMessagesProtocol..messageHandler)</code> | Callback to fire. |

<a name="DynamicMessagesProtocol+removeCallback"></a>

#### *dynamicMessagesProtocol.removeCallback(messageType, callback)*
Removes a callback for a specified message type.

**Kind**: instance method of <code>[DynamicMessagesProtocol](#DynamicMessagesProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messageType | <code>string</code> | Message type. |
| callback | <code>[messageHandler](#DynamicMessagesProtocol..messageHandler)</code> | Callback to remove. |

<a name="DynamicMessagesProtocol+removeAllCallbacks"></a>

#### *dynamicMessagesProtocol.removeAllCallbacks(messageType)*
Removes all callbacks for a specified message type.

**Kind**: instance method of <code>[DynamicMessagesProtocol](#DynamicMessagesProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| messageType | <code>string</code> | Message type. |

<a name="DynamicMessagesProtocol+send"></a>

#### *dynamicMessagesProtocol.send(messageType, payload, sessionIds, deferred)*
Sends the specified message type with payload.

**Kind**: instance method of <code>[DynamicMessagesProtocol](#DynamicMessagesProtocol)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| messageType | <code>string</code> |  | Message type. |
| payload | <code>Object</code> |  | Object with the data. |
| sessionIds | <code>Array</code> &#124; <code>string</code> |  | Session id or an array of it. |
| deferred | <code>boolean</code> | <code>false</code> | Specifies whether to defer the sending in the loop. |

<a name="DynamicMessagesProtocol..messageHandler"></a>

#### *DynamicMessagesProtocol~messageHandler : <code>function</code>*
**Kind**: inner typedef of <code>[DynamicMessagesProtocol](#DynamicMessagesProtocol)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Message received on the socket. |
| [sessionId] | <code>string</code> | Meteor's internal session id. |

