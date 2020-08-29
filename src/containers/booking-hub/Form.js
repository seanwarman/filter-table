import React, { Component } from 'react';
import BookingForm from '../../components/BookingForm';

export default class BookingHubForm extends Component {

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
    ];
    return result;
  }
  
  render() {
    return (
      <BookingForm 
        {...this.props}
        validation={this.handleValidation}
        // update={this.handleForm}
        saveStatusButtons={['Draft', 'Live']}
        newBookingRoute={'/bookinghub/bookings/form'}
        viewBookingRoute={'/bookinghub/bookings/booking'}
        changeHeaderProps={['hdd', 'BookingHub', [
          {name: 'Bookings', url: '/bookinghub/bookings'},
          {name: 'Booking Form', url: '/bookinghub/form'}
        ]]}
      />
    )
  }
}