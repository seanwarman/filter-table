import { message } from 'antd';
import { API } from './apiMethods';
import Actions from '../actions/booking-hub/Actions'
import SocketLibrary from '../libs/SocketLibrary'

// const stage = (window.location.origin.includes('localhost') || window.location.origin === 'https://dev.biggly.co.uk') ?  'dev' : 'staging'
const stage = (
  window.location.origin.includes('localhost') || 
  window.location.origin.includes('192.168') || 
  window.location.origin === 'https://dev.biggly.co.uk'
) ?  'dev' : 'staging'

export default function(booking, user, loadDataAndSetState, socketLib) {

  if(!booking.bookingsKey || !booking.bookingDivKey) throw Error('The booking must have a bookingsKey and bookingDivKey for bookingViewApi')

  const actions = new Actions(user.apiKey, user.userKey, socketLib)
  
  return {
  
    updateBooking: async (mutatedBooking, queried) => {

      const result = await actions.updateBooking(booking.bookingsKey, mutatedBooking, booking.bookingDivKey)
      if(queried === undefined) return result;

      let description;
      if(queried) {
        description = `${user.firstName} ${user.lastName} moved this booking into Queried Mode.`
      } else {
        description = `${user.firstName} ${user.lastName} moved this booking out of Queried Mode.`
      }

      await actions.createAudit({
        description,
        status: booking.currentStatus,
        bookingsKey: booking.bookingsKey,
        createdUserKey: user.userKey,
      })

      return result;
    },

    handleUpdate: async (mutatedBooking) => {

      let result = await actions.updateBooking(booking.bookingsKey, mutatedBooking, booking.bookingDivKey)
      if(loadDataAndSetState) {
        await loadDataAndSetState();
      }
      return;
    },
  
    handleQuery: async body => {
      // KEEP: this creates an audit and a notification while updating the booking.
      try {
        await API.put(this.props.stage, `/bookingpublic/key/${user.apiKey}/bookings/${booking.bookingsKey}/audit/notify`, {
          ...body
        });
      } catch (err) {
        console.log('There was an error updating the booking: ', err);
        message.error('You\'re booking didn\'t update properly, please try again.');
      }

      // TODO: remove this when this API endpoint has been replaced
      let socketLib = new SocketLibrary()
      await socketLib.transmit(booking.bookingDivKey)

      if(loadDataAndSetState) await loadDataAndSetState();
      return 
    },
  
    handleUpdateGroup: async (groupKey, mutatedBooking, auditBody) => {
      // KEEP: this updates the group of bookings and creates an audit.
      try {
        await API.put(stage, `/bookingpublic/key/${user.apiKey}/bookings/group/${groupKey}`, {
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
      await socketLib.transmit(booking.bookingDivKey)

      return await loadDataAndSetState();
    },

    createAudit: async auditBody => {
      return await actions.createAudit(auditBody)
    },
  
    handleAudit: async (auditBody) => {
      await actions.createAudit(auditBody)
      if(loadDataAndSetState) await loadDataAndSetState();
      return;
    },

    getComments: async() => {
      let result = await actions.getComments(booking.bookingsKey)
      return result;
    },
  
    createComment: async (comment, notifyBody) => {
      const result = await actions.createComment(comment, booking.bookingDivKey)

      await actions.createAudit({
        description: `${user.firstName} ${user.lastName} commented on the booking: ${decodeURIComponent(booking.bookingName)}`,
        status: booking.currentStatus,
        bookingsKey: booking.bookingsKey,
        createdUserKey: user.userKey,
      })

      if(notifyBody) {
        // KEEP: creates a notification with a special booking notify template the key will be in the controller.
        try {
          await API.post(stage, `/custom/key/${user.apiKey}/user/${user.userKey}/notify/bookings/${booking.bookingsKey}`, notifyBody);
        } catch (error) {
          console.log('There was an error creating the email record: ', error);
        }
      }

      if(!result || (result || {}).affectedRows !== 1) {
        message.error('BMS wasn\'t able to save your comment at this time.');
      }
      
      if(loadDataAndSetState) await loadDataAndSetState();
      return result;
    },

    getUploads: async() => {
      const result = await actions.getUploads(booking.bookingsKey)
      return result;
    },

    createUpload: async upload => {
      const result = await actions.createUpload(upload, booking.bookingDivKey)

      await actions.createAudit({
        description: `${user.firstName} ${user.lastName} uploaded a file to this booking called: ${decodeURIComponent(upload.fileName)}`,
        status: booking.currentStatus,
        bookingsKey: booking.bookingsKey,
        createdUserKey: user.userKey,
      })

      return result;
    }
  }
} 

