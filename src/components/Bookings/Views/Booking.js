import React, { Component } from 'react';
import BookingView from '../BookingView';
import Handlers from '../../../actions/booking-hub/Handlers';
import { message } from 'antd';
import SocketLibrary from '../../../libs/SocketLibrary'

export default class Booking extends Component {
  socketLib = new SocketLibrary()
  state = {
    booking: null,
    jsonStatus: null,
    loaded: false,
    handlers: null,
  }

  async componentDidMount() {
    this.props.changeHeader(this.props.icon, this.props.bookingDivName, [
      { name: `Bookings Table`, url: `/${this.props.slugName}/bookings` },
      { name: `Booking`, url: `/${this.props.slugName}/bookings/booking/` + this.props.match.params.bookingsKey }
    ]);

    this.socketLib.addSocketEvent(this.props.bookingDivKey, this.loadDataAndSetState)

    this.loadDataAndSetState();
  }

  componentWillUnmount() {
    this.socketLib.forceClose()
  }

  loadDataAndSetState = async () => {
    let stateCopy = { ...this.state };
    stateCopy.booking = await this.getBooking(this.props.user.apiKey, this.props.match.params.bookingsKey);

    if(!stateCopy.booking) {
      message.warn('You\'re partner access does not allow you to view this booking.');
      this.props.history.push('/scribr/bookings');
      return;
    }

    stateCopy.handlers = new Handlers(stateCopy.booking, this.props.user, this.loadDataAndSetState, this.props.socketLib);

    stateCopy.jsonStatus = stateCopy.booking.jsonStatus
    stateCopy.loaded = true;

    this.setState(stateCopy);
    return;
  }

  getBooking = async (apiKey, bookingsKey) => {
    let booking = await this.props.api.getPublic({
      name: 'bms_booking.bookings',
      columns: [
        {name: 'bookingDivKey'},
        {name: 'bookingName'},
        {name: 'bookingsKey'},
        {name: 'colorLabel'},
        {name: 'completedDate'},
        {name: 'created'},
        {name: 'createdPartnerKey'},
        {name: 'createdUserKey'},
        {name: 'currentStatus'},
        {name: 'divKey'},
        {name: 'dueDate'},
        {name: 'flagged'},
        {name: 'flags'},
        {name: 'groupKey'},
        {name: 'jsonForm'},
        {name: 'bms_booking.bookingDivisions', columns: [
          {name: 'jsonStatus'}
        ], where: [
          'bookings.bookingDivKey = bookingDivisions.bookingDivKey'
        ]},
        // {name: 'jsonStatus'},
        {name: 'units'},
        {name: 'updated'},
        {name: 'assignedUserKey'},
        {name: 'tmpKey'},
        {
          name: 'bms_booking.divisionTemplates',
          columns: [
            {name: 'tmpName'}
          ],
          where: [
            'divisionTemplates.tmpKey = bookings.tmpKey'
          ]
        },
        {
          name: 'Biggly.users',
          columns: [
            {name: 'firstName', as: 'assignedFirstName'},
            {name: 'lastName', as: 'assignedLastName'},
            {name: 'emailAddress', as: 'assignedEmailAddress'},
            {name: 'partnerKey', as: 'assignedPartnerKey'},
          ],
          where: [
            'users.userKey = bookings.assignedUserKey'
          ]
        },
        {
          name: 'Biggly.customers',
          columns: [
            {name: 'customerKey'},
            {name: 'customerName'},
            {name: 'partnerAccMan'},
          ],
          where: [
            'customers.customerKey = bookings.customerKey'
          ]
        },
        {
          name: 'Biggly.partners',
          columns: [
            {name: 'partnerKey'},
            {name: 'partnerName'},
          ],
          where: [
            'partners.partnerKey = bookings.createdPartnerKey'
          ]
        },
        {
          name: 'Biggly.users',
          columns: [
            {name: 'firstName', as: 'createdByFirstName'},
            {name: 'lastName', as: 'createdByLastName'},
            {name: 'emailAddress', as: 'createdByEmailAddress'},
          ],
          where: [
            'users.userKey = bookings.createdUserKey'
          ]
        },
      ],
      where: [
        `bookingsKey = "${bookingsKey}"`
      ]
    });
    return booking;
  }

  handleReload = async(text) => {
    await this.loadDataAndSetState();
    if(!text) {
      message.info('Booking reloaded, check you still want to make your changes.');
      return;
    }
    message.info(text);
    return;
  }

  render() {
    return (
      this.state.loaded &&
      <BookingView
        // When this component is fully implemented we should get rid of this...
        {...this.props}

        // Inputs
        user={this.props.user}
        jsonStatus={this.state.booking.jsonStatus}
        bookingsKey={this.props.match.params.bookingsKey}
        booking={this.state.booking}

        // Outputs
        update={this.state.handlers.handleUpdate}
        updateQuery={this.state.handlers.handleQuery}
        updateGroup={this.state.handlers.handleUpdateGroup}
        // No longer used, the audits are now auto generated in the update actions.
        // createAudit={this.state.handlers.handleAudit}
        reload={this.handleReload}
        getUploads={this.state.handlers.getUploads}
        getComments={this.state.handlers.getComments}
        updateBooking={this.state.handlers.updateBooking}
        createComment={this.state.handlers.createComment}
        createUpload={this.state.handlers.createUpload}

        allowedToEditFields={['Admin', 'Supplier Admin']}
        api={this.props.api}
      />
    )
  }
}
