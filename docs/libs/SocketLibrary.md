# SocketLibrary

Import and create a new socket library object.

```js
import SocketLibrary from '../../libs/SocketLibrary'

const socketLib = new SocketLibrary()
```

### addSocketEvent

Add an event listener using `addSocketEvent`. This function takes
a string, which will be the name of the **channel** (named after 
the `bookingDivKey` here), and the event function as the second.

```js
socketLib.addSocketEvent(bookingDivKey, () => {
  console.log('Socket called!')
})
```

This will also establish the connection.

### sendSocketAction

Sends an event out to the given **channel** string.

```js
socketLib.sendSocketAction(bookingDivKey)
```

In the above case `sendSocketAction` will trigger the console log
and print 'Socket called!'.

### forceClose

Closes the connection and removes the internal *connection* object, 
effectively resetting the socketLib object. Calling `addSocketEvent` 
again will create a brand new connection.
