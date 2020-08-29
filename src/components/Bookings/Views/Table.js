import React, { Component } from 'react';
import BookingsTable from '../../Tables/BookingsTable';

export default class Table extends Component {
  componentDidMount() {
    this.props.changeHeader(this.props.icon, this.props.bookingDivName, [
      { name: 'Bookings Table', url: `/${this.props.slugName}/bookings` }
    ]);
  }
  render() {
    return (
      <BookingsTable 
        {...this.props}
        bookingDivKey={this.props.bookingDivKey}
        newBookingRoute={`/${this.props.slugName}/bookings/form`}
        viewBookingRoute={`/${this.props.slugName}/bookings/booking`}
      />
    )
  }
}
