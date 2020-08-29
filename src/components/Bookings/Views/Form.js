import React, { Component } from 'react';
import BookingForm from '../../BookingForm';

export default class Form extends Component {

  flattenArr = (arr) => {
    return arr.reduce((flat, toFlatten) => {
      return this.flattenArr(flat).concat(toFlatten instanceof Array ? this.flattenArr(toFlatten) : toFlatten);
    }, []);
  }

  handleValidation = state => {
    const jsonForm = state.jsonForm.filter(item => (
      item.required === true && item.type !== 'multi'
    ));
    let multis = state.jsonForm.filter(item => (
      item.required === true && item.type === 'multi'
    ));
    multis = multis.reduce((arr, input) => {
      return this.flattenArr(arr).concat(this.flattenArr(input.children));
    }, []);

    const result = [
      ...multis,
      ...jsonForm,
      { value: state.formFields.bookingName },
      { value: state.formFields.dueDate },
      { value: state.formFields.customerKey },
      // This last option makes the button disable after clicking save
      { value: state.buttonDisabled }
      // Note: there's no assignedPartnerKey value here because we want that to be optional.
    ];
    return result;
  }
  
  render() {
    return (
      <BookingForm 
        {...this.props}
        validation={this.handleValidation}
        saveStatusButtons={['Draft', 'Live']}
        bookingDivKey={this.props.bookingDivKey}
        newBookingRoute={`/${this.props.slugName}/bookings/form`}
        viewBookingRoute={`/${this.props.slugName}/bookings/booking`}
        changeHeaderProps={[this.props.icon, this.props.bookingDivName, [
          { name: `Bookings Table`, url: `/${this.props.slugName}/bookings` },
          { name: `Booking Form`, url: `/${this.props.slugName}/bookings/form` }
        ]]}
      />
    )
  }
}
