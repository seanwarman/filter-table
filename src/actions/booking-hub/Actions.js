import api from '../../libs/apiMethods'
import Queries from './Queries'
import Helper from './Helper'
import SocketLibrary from '../../libs/SocketLibrary'
import uuid from 'uuid'

export default class Actions {

  constructor(apiKey, userKey) {

    this.userKey = userKey
    this.api = api(apiKey)
    this.queries = new Queries()
    this.helper = new Helper()

  }

  getArchivedBookings(where, limit, sortBy) {

    let queryObj = this.queries.getArchivedBookings(where, limit, sortBy)
    // I'm making the limit param optional here...
    if(limit && (limit || []).length > 0) queryObj.limit = limit
    return this.api.listPublic(queryObj)

  }

  getAllBookingsTableBookings(where, sort, limit) {
    let queryObj = this.queries.getBookingsTableBookings(where, sort)
    // I'm making the limit param optional here...
    if(limit && (limit || []).length > 0) queryObj.limit = limit
    return this.api.listPublic(queryObj)
  }

  getBookingsTableBookings(where, limit, sortBy) {
    let queryObj = this.queries.getBookingsTableBookings(where, sortBy)
    // I'm making the limit param optional here...
    if(limit && (limit || []).length > 0) queryObj.limit = limit
    return this.api.listPublic(queryObj)
  }

  getBookingDiv(bookingDivKey) {
    return this.api.getPublic(this.queries.getBookingDiv(bookingDivKey))
  }

  getCompiledFlagsFromAllDivisions() {
    return this.api.listAdmin(this.queries.getCompiledFlagsFromAllDivisions())
  }

  getBookingFormBookingDiv(bookingDivKey) {
    return this.api.getPublic(this.queries.getBookingFormBookingDiv(bookingDivKey))
  }

  getCustomers(partnerKey) {
    return this.api.listPublic(this.queries.getCustomers(partnerKey))
  }

  createCustomer(customer) {
    return this.api.createPublic(this.queries.createCustomer(), customer, 'customerKey', false, true)
  }

  deleteStateRecord(bookingStateKey) {
    return this.api.deletePublic(this.queries.deleteStateRecord(bookingStateKey))
  }

  addStateRecordForFilterView(data) {
    return this.api.createPublic(this.queries.addStateRecord(), data, 'bookingStateKey', false, true)
  }

  addStateRecord(bookingStateName, userKey, bookingDivKey, jsonState) {
    return this.api.createPublic(this.queries.addStateRecord(), {
      bookingStateName,
      userKey,
      bookingDivKey,
      jsonState,
    }, 'bookingStateKey', false, true)
  }

  getBookingsSmall(or) {
    return this.api.listPublic(this.queries.getBookingsSmall(or))
  }

  getUploadsByBookingsKeys(bookingsKeys) {
    return this.api.listPublic(this.queries.getUploadsByBookingsKeys(bookingsKeys))
  }

  getCommentsByBookingsKeys(bookingsKeys) {
    return this.api.listPublic(this.queries.getCommentsByBookingsKeys(bookingsKeys))
  }

  getComments(bookingsKey) {
    return this.api.listPublic(this.queries.getComments(bookingsKey))
  }

  getBookingStatesByUser(userKey) {
    return this.api.listPublic(this.queries.getBookingStatesByUser(userKey))
  }

  getBookingStatesForFilterView(userKey) {
    return this.api.listPublic(this.queries.getBookingStatesForFilterView(userKey))
  }

  getBookingStates(userKey, bookingDivKey) {
    return this.api.listPublic(this.queries.getBookingStates(userKey, bookingDivKey))
  }

  getUploads(bookingsKey) {
    return this.api.listPublic(this.queries.getUploads(bookingsKey))
  }

  async proceedBookings(booking, bookingsKeys, bookingDivKey) {

    const or = bookingsKeys.map(bookingsKey => (`bookingsKey = "${bookingsKey}"`)).join(' OR ')

    const result = await this.api.updatePublic(this.queries.proceedBookings(booking, or), booking)

    for(let bKey of bookingsKeys) {

      this.createAudit(bKey, booking, 'Booking updated', () => {
        const socketLib = new SocketLibrary()
        socketLib.transmit(bookingDivKey)
      })

    }

    return result
  }

  async updateBookings(booking, bookingsKeys, bookingDivKey) {
    
    const or = bookingsKeys.map(bookingsKey => (`bookingsKey = "${bookingsKey}"`)).join(' OR ')
    
    const result = await this.api.updatePublic(this.queries.updateBookings(booking, or), booking)

    for(let bKey of bookingsKeys) {

      this.createAudit(bKey, booking, 'Booking updated', () => {
        // const socketLib = new SocketLibrary()
        // socketLib.transmit(bookingDivKey)
      })

    }

    return result
  }

  // async createComment(bookingsKey, comment, createdUserKey) {

  //   const result = await this.api.createPublic(this.queries.createComment(), 
  //     {bookingsKey, comment, createdUserKey}, 'bookingCommentsKey', false, true
  //   )

  //   await this.createAudit(bookingsKey, comment, 'Comment created', () => {
  //     this.socketLib.sendSocketAction('Booking')
  //   })

  //   return result
  // }

  async updateBooking(bookingsKey, booking, bookingDivKey) {

    console.log('updateBooking')
    let result = await this.api.updatePublic(this.queries.updateBooking(bookingsKey, booking), booking)

    await this.createAudit(bookingsKey, booking, 'Booking updated', () => {
      const socketLib = new SocketLibrary()
      socketLib.transmit(bookingDivKey)
    })

    return result

  }

  async createUpload(upload, bookingDivKey) {

    let result = await this.api.createPublic(this.queries.createUpload(upload), upload, 'uploadsKey')
    await this.createAudit(upload.bookingsKey, upload, 'Upload created', () => {
      const socketLib = new SocketLibrary()
      socketLib.transmit(bookingDivKey)
    })
    return result

  }

  async createCommentsByBookingsKeys(bookingsKeys, commentProp) {

    for await (const bookingsKey of bookingsKeys) {

      const comment = {
        ...commentProp,
        bookingsKey,
        bookingCommentsKey: uuid.v1()
      }

      await this.api.createPublic(this.queries.createComment(), comment)

      await this.createAudit(bookingsKey, comment, 'Comment created', () => {

        // console.log('this.socketLib : ', this.socketLib)
        // const socketLib = new SocketLibrary()
        // socketLib.transmit(bookingDivKey)
      })

    }

  }

  async createComment(comment, bookingDivKey) {

    let result = await this.api.createPublic(this.queries.createComment(), comment, 'bookingCommentsKey')
    await this.createAudit(comment.bookingsKey, comment, 'Comment created', () => {

      console.log('this.socketLib : ', this.socketLib)
      const socketLib = new SocketLibrary()
      socketLib.transmit(bookingDivKey)
    })
    return result

  }

  async createAudit(bookingsKey, record, action, socketAction) {

    const description = this.helper.createAuditDescription(action, record)
    const createdUserKey = this.userKey

    let result = await this.api.createPublic(this.queries.createAudit(), {description, createdUserKey, bookingsKey}, 'bookingAuditKey')

    if(socketAction) socketAction()

    return result
  }
}
