import { message } from 'antd';
import { API } from '../../libs/apiMethods';
import Actions from './Actions'
import SocketLibrary from '../../libs/SocketLibrary'

// const stage = (window.location.origin.includes('localhost') || window.location.origin === 'https://dev.biggly.co.uk') ?  'dev' : 'staging'
const stage = (
  window.location.origin.includes('localhost') || 
  window.location.origin.includes('192.168') || 
  window.location.origin === 'https://dev.biggly.co.uk'
) ?  'dev' : 'staging'

// TODO: This is a pattern that needs fixing. 
// This class can only deal with a single booking at a time
// and so could do with either going somewhere else or having
// it's implementation changed in some way.

export default class Handlers {
  constructor(booking, user, loadDataAndSetState) {
    this.actions = new Actions(user.apiKey, user.userKey)
    this.booking = booking
    this.user = user
    this.loadDataAndSetState = loadDataAndSetState
  }

  updateBooking = async (mutatedBooking, queried) => {
    console.log('updateing booking..');
    const result = await this.actions.updateBooking(this.booking.bookingsKey, mutatedBooking, this.booking.bookingDivKey)
    // if(queried === undefined) return result;

    // let description;
    // if(queried) {
    //   description = `${this.user.firstName} ${this.user.lastName} moved this booking into Queried Mode.`
    // } else {
    //   description = `${this.user.firstName} ${this.user.lastName} moved this booking out of Queried Mode.`
    // }

    // await this.actions.createAudit({
    //   description,
    //   status: this.booking.currentStatus,
    //   bookingsKey: this.booking.bookingsKey,
    //   createdUserKey: this.user.userKey,
    // })

    return result;
  }

  handleUpdate = async (mutatedBooking) => {
    await this.actions.updateBooking(this.booking.bookingsKey, mutatedBooking, this.booking.bookingDivKey)
    if(this.loadDataAndSetState) {
      await this.loadDataAndSetState();
    }
    return;
  }

  handleQuery = async (body) => {
    // KEEP: this creates an audit and a notification while updating the booking.
    try {
      await API.put(this.props.stage, `/bookingpublic/key/${this.user.apiKey}/bookings/${this.booking.bookingsKey}/audit/notify`, {
        ...body
      });
    } catch (err) {
      console.log('There was an error updating the booking: ', err);
      message.error('You\'re booking didn\'t update properly, please try again.');
    }

    // TODO: remove this when this API endpoint has been replaced
    let socketLib = new SocketLibrary()
    await socketLib.transmit(this.booking.bookingDivKey)


    if(this.loadDataAndSetState) await this.loadDataAndSetState();
    return 
  }

  handleUpdateGroup = async (groupKey, mutatedBooking, auditBody) => {
    // console.log('handleUpdateGroup :', mutatedBooking)
    // KEEP: this updates the group of bookings and creates an audit.
    try {
      await API.put(stage, `/bookingpublic/key/${this.user.apiKey}/bookings/group/${groupKey}`, {
        bookingBody: mutatedBooking,
        auditBody
      });
    } catch (err) {
      console.log('There was an error trying to update the group of bookings', err);
      message.error('There was an error trying update this group of bookings. Please try again');
      return;
    }

    // TODO: remove this when this API endpoint has been replaced
    let socketLib = new SocketLibrary()
    await socketLib.transmit(this.booking.bookingDivKey)

    return await this.loadDataAndSetState();
  }

  // createAudit = async (auditBody) => {
  //   return await this.actions.createAudit(auditBody)
  // }

  // handleAudit = async (auditBody) => {
  //   await this.actions.createAudit(auditBody)
  //   if(this.loadDataAndSetState) await this.loadDataAndSetState();
  //   return;
  // }

  getComments = async () => {
    let result = await this.actions.getComments(this.booking.bookingsKey)
    return result;
  }

  createComment = async (comment, notifyBody) => {
    const result = await this.actions.createComment(comment, this.booking.bookingDivKey)

    // await this.actions.createAudit({
    //   description: `${this.user.firstName} ${this.user.lastName} commented on the booking: ${decodeURIComponent(this.booking.bookingName)}`,
    //   status: this.booking.currentStatus,
    //   bookingsKey: this.booking.bookingsKey,
    //   createdUserKey: this.user.userKey,
    // })

    if(notifyBody) {
      // KEEP: creates a notification with a special booking notify template the key will be in the controller.
      try {
        await API.post(stage, `/custom/key/${this.user.apiKey}/user/${this.user.userKey}/notify/bookings/${this.booking.bookingsKey}`, notifyBody
        );
      } catch (error) {
        console.log('There was an error creating the email record: ', error);
      }
    }

    if(!result || (result || {}).affectedRows !== 1) {
      message.error('BMS wasn\'t able to save your comment at this time.');
    }

    if(this.loadDataAndSetState) await this.loadDataAndSetState();
    return result;
  }

  getUploads = async () => {
    const result = await this.actions.getUploads(this.booking.bookingsKey)
    return result;
  }

  createUpload = async (upload, bookingDivKey) => {
    const result = await this.actions.createUpload(upload, bookingDivKey)

    // await this.actions.createAudit({
    //   description: `${this.user.firstName} ${this.user.lastName} uploaded a file to this booking called: ${decodeURIComponent(upload.fileName)}`,
    //   status: this.booking.currentStatus,
    //   bookingsKey: this.booking.bookingsKey,
    //   createdUserKey: this.user.userKey,
    // })

    return result;
  }
}
