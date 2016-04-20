## Meteor Custom Protocols

Super easy way of sending something else than DDP over default Meteor socket connection. Just make your own protocol (or use JsonProtocol) and voila.

### Wait, why?

In many cases when you want to send some volatile data, Meteor's normal way of sending data through either publications or methods might seem like an overkill.
Imagine for example a chat in which you do not want to store the history. It would be nice if you could just send and receive some data on both server and client without using local collections or methods.
Other packages like *streamy* or *meteor-streams* are already giving you nice API for that, but inside they are still passing data using Meteor's API. That of course is not a problem until performance and flexibility matters.
This package was made to not only give you direct access to the socket but also to give some basic way to structure and define you data flow. What is most important you can encode your data however you want, there is no need to use Json.
To send the data directly on the default Meteor connection this package uses the [meteor-direct-stream-access](https://github.com/wojtkowiak/meteor-direct-stream-access) which also ensures that any custom message will not interfere with Meteor's DDP protocol.  
 
### Installation

Just add the package to your project with:

`meteor add omega:custom-protocol`

## Usage

There are two ways you can use this package. 
If you just want to send some data encoded with JSON there is a prebuilt JsonProtocol class exported for you.
Below is a simple example on how to use it:

### Using JsonProtocol

First get the singleton instance:
```javascript
let protocol = JsonProtocol.getInstance();
```

Sending:
```javascript
// On the client
protocol.send('myMessage', { myData: 'to send' });

// On the server you need to specify a Meteor session id you want to send to
protocol.send('myMessage', { myData: 'to send' }, 'as3ijnso03sw');

```

Receiving:
```javascript
// sessionId is only provided on server
protocol.on('myMessage', (data, sessionId) => {});
```

And that is basically it. There is just one limitation - your data object can not have a `__type` field because it is used to store your message name. 
You can change the field name to something else by inovking `protocol.setTypeField('another field name');`.

### Creating you own protocol

Below is a step by step mini tutorial on how to create a simple protocol yourself. For example we will just encode data with JSON, but you can take a look [here](https://github.com/wojtkowiak/meteor-transfer-rate-monitor/blob/master/src/lib/TransferRate.protocol.js) if you want to see a different encoding example. Lets proceed.

1. Create a class that extends `CustomProtocol`

    ```javascript
    class MyProtocol extends CustomProtocol {
    
    }
    ```

2. Save this file with an `.protocol.js` extension (see why).
3. Register your protocol and register at least one message. `registerProtocol` will register messages for you.

    ```javascript
        constructor() {
            super();
            this.MY_MESSAGE = 1;
            this._messages[this.MY_MESSAGE_] = { /*definition object*/ };
            this.registerProtocol();
         }
    ```

    or you can can call `registerMessage` explicitly:
    
    ```javascript
        constructor() {
            super();
            // Message id must be int.
            this.MY_MESSAGE = 1;
            this.registerProtocol();
            this.registerMessage(this.MY_MESSAGE, { /*definition object*/ });
         }
    ```
    What is the definition object - check here.

4. Create `encode` / `decode` methods:

    ```javascript
        // (!)Payload passed is always wrapped in an array.
        encode(messageId, definition, payload = []}) {
            return JSON.stringify(payload[0]);
        }
    
        decode(messageId, definiton, rawMessage) {
            return JSON.parse(rawMessage);
        }
    ```
    What is the definition - check here.

5. Use it:

    ```javascript
    let protocol = new MyProtocol();
    
    // on client
    protocol.send(protocol.MY_MESSAGE, { some: 'data' });
   
    // on server 
    protocol.send(protocol.MY_MESSAGE, { some: 'data' }, 'sessionId');
    
    // register callback to receive the data
    // sessionId is only provided on server
    protocol.on(protocol.MY_MESSAGE, (data, sessionId) => { console.log(data) });
    ```
    
If you want to send different data and receive them on different callback you have to declare a message for each of them or create a dynamic messages type protocol - check out below. 
    
### Where I can get the session id(s) I want to send to?
    
First way if you want to broadcast to all clients connected to your server.
```javascript
Meteor.onConnection((connection) => {
    let sessionId = connection.id;
    
    // Here store the sessionId somewhere.
    
    connection.onClose(() => {
        // Here delete the stored sessionId.
    });
});
```

If you want a pub/sub functionality why not use Meteor's publish/subscribe. Here is how:

```javascript
Meteor.publish('subscribeToMyProtocol', function () {
    let sessionId = this.connection.id;
       
    // Here store the sessionId somewhere.
    // You can also store this.userId of subscribed client and therefore be able to send to specified clients based on the user ids.
     
    this.onStop(() => {
        // Here delete the stored sessionId.
    });
});
```
On the client do not forget to `Meteor.subscribe`.

An example of using `publish` is [here](https://github.com/wojtkowiak/meteor-transfer-rate-monitor/blob/master/src/TransferRateMonitor.server.js#L100).
If you would like me to make some utils to ease this a little, file an issue and I will create some nice API for that.


### What is the - definition object
    
It is just a place to store some information used by your encode/decode methods. For example you could do a lame object values to string serializer like this:

```javascript
// in the constrcutor of your protocol define a message with a definition object.
this._messages[0] = { fields: [ 'field1', 'field2' ]};
```
```javascript
encode(messageId, definition, payload = []}) {
    let data = payload[0];
    let encodedMessage = '';
    definition.fields.forEach((field) => {
        encodedMessage += data[field] + '|'
    });
    return encodedMessage;
}
decode(messageId, definiton, rawMessage) {
    let splitted = rawMessage.split('|');
    let i = 0;
    let decodedObject = {};
    definition.fields.forEach((field) => {
        decodedObject[field] = splitted[i];
        i++;
    });
    return decodedObject;
}
```
    
### Protocol types - Declared or Dynamic messages

Protocols with declared messages look like the one in the tutorial. The main rule is that all the messages are defined in the constructor. Ids should be integeres and they can also have the definition object attached.
If you do not want to declare messages in the constructor you can just extend `DynamicMessagesProtocol` instead of `CustomProtocol` and get some more flexibility.
Now you can send any message you like at any time. Additionally now you can use strings as the message id in `send`:
```javascript
protocol.send('my message id', { data });
```
Your `encode`/`decode` methods will always get 0 as the `messageId` and definition object of course will be empty.
The only enforcement is that the object returned from your `decode` method, must have a field which says what message id that is. That is used internally to fire the appropriate callback set with `protocol.on('my message id', (data) => {});`.
By default the field name is `__type`. You can change the field name to something else by invoking `this.setTypeField('another field name');` in your protocol constructor.
You should also take care of ensuring that your protocol will be a singleton (see why below).
The provided in this package `JsonProtocol` is a simple dynamic messages protocol example. 

### Why do I need to use `protocol.js` extension for my protocols.

Every protocol file is index and assigned with an unique id in your app. 
Because your app can use many protocols at the same time, internally they are distinguished by the id which is transmitted in the first bits of the message.
The index is saved in `private/custom_protocols_index.json` in your app dir. **You should include that file in your repo.**
Please do not modify it unless you know what you are doing. Changing a protocol id when you have your app released will make your server backwards incompatible.
Protocols are index on every build. Once you add the file with `protocol.js` to your project, after first build it will get the id and it is guaranteed that it will not change.
However if you will remove the file, do a build, add the file again, do the build - it might not get the same id it had before - be aware of that!

## CustomProtocol API

Full API documentation if you need it :smile:.
Client and server only differ on send method definition.
[Client API](CLIENT.md)
[Server API](SERVER.md)
You can also check:
[DynamicMessagesProtocol API](DYNAMIC_MESSAGES_PROTOCOL.md)

## Contributing

If you discovered a bug please file an issue. PR are always welcome, but be sure to run and update the tests.
Please also regenerate the docs running `gulp docs`.

### Examples

Here I will keep track of other packages using custom protocols so you can take a look how somebody is using it.
[meteor-transfer-rate-monitor](https://github.com/wojtkowiak/meteor-transfer-rate-monitor/blob/master/src/lib/TransferRate.protocol.js)

### Tests

This package is fully tested and so is the used [meteor-direct-stream-access](https://github.com/wojtkowiak/meteor-direct-stream-access) package.
To run the tests, being inside the meteor project that uses this package type:

`meteor test-packages --driver-package=practicalmeteor:mocha omega:custom-protocols`

and check out the results in the browser.

*Some tests are failing on second and consecutive runs. This is nothing to worry about.*

### TODO

* [ ] support `DDP.connect`
