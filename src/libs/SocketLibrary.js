import uuid from 'uuid'
import { w3cwebsocket } from 'websocket'

export default class SocketLibrary {

  method = null
  connection = {}
  channel = ''
  id = ''

  // If the connection drops we auto reconnect but if we want to
  // force the connection to close then put this flag to true.
  selfClose = false


  connect = async(callback) => {

    this.connection = new w3cwebsocket('wss://hw7sp1rlak.execute-api.eu-west-1.amazonaws.com/dev')

    // We want to call our this.method function every time we recieve a message event.
    this.connection.onmessage = this.onmessage

    this.connection.onclose = this.onclose

    if(typeof callback === 'function') callback()

  }

  forceClose = async() => {

    // console.log('Terminating the connection...')
    this.selfClose = true

    if(typeof this.connection.close !== 'function') return

    console.log('closing...')
    await this.connection.close()
    console.log('...closed')

    this.connection = {}
    this.method = null

  }

  // Send a socket event to all the listening apps, attach an id so that
  // we can tell if this app made the send. That way we can ignore it.
  sendSocketAction = async(channel) => {

    if(!this.connection.readyState) return

    console.log('Sending socket action...')

    if(typeof this.connection.send !== 'function') return

    this.id = uuid.v1()
    this.connection.send(JSON.stringify({ action: 'call', channel, id: this.id }))

  }

  addSocketEvent = async(channel, method) => {


    // If the socket is already connected force close it first.
    if(this.connection.readyState) await this.forceClose()

    // All socket methods belong to certain channels so we know
    // when to call them and when not to. 
    //
    // The bookings events for example are all set to channels
    // named after their bookingDivKey keys. This way Scribr bookings
    // only update views in the Scribr division.
    // 
    // It also saves us from using made-up names for channels
    // we just use the relationships already established in the
    // database.

    console.log('Adding socket event and connecting...')
    this.channel = channel
    this.method = method
    this.connect()
    
  }

  // Check the event 'channel' and call our method if it's subscribed 
  // to the right one.
  onmessage = async(event) => {

    console.log('Event triggered...')

    if(!this.method) {
      // No method to call, ignore
      return
    }

    let channel
    let id
    let message

    try {
      channel = JSON.parse(event.data).channel
      id = JSON.parse(event.data).id
      message = JSON.parse(event.data).message
    } catch(err) {
      console.log('Event in wrong format: ', err)
      console.log('Event: ', event)
      return
    }

    // If this app sent the websocket we get a second event
    // with a message of "Internal server error".
    //
    // TODO fix the websocket so it stops calling this second event, until
    // then just ignore this event.
    if(message === 'Internal server error') {
      // console.log('second event, ignore')
      return 
    }

    console.log(this.connection)

    // If the event belongs to another channel ignore it.
    // Unless it's mean for all channels...
    if(channel !== this.channel && channel !== 'All' && this.channel !== 'All') {
      console.log('Not this channel, ignore')
      return
    }


    // If this event has the same id as this instance it
    // means we sent the update so ignore it.
    if(id === this.id) {
      // console.log('I sent this event, ignore')
      // console.log('I sent this event')
      return
    }

    console.log('Calling socket method')

    this.method()
  }

  onclose = () => {

    // console.log('connection closing...')

    // If we called forceClose don't reconnect.
    if(this.selfClose) return

    // Otherwise the connection dropped out and we do want
    // to reconnect.
    //
    // console.log('...reconnecting')
    this.connect()

  }

  async transmit(channel) {

    this.connect()

    this.connection.onopen = () => {
      this.sendSocketAction(channel)
      this.forceClose()
    }
  }

}
