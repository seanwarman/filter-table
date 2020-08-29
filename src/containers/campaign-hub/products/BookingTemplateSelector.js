import React from 'react'
import BigglyGetMenu from '../../../components/BigglyGetMenu.js'
import Actions from '../../../actions/campaign-hub/Actions.js'

function BookingTemplateSelector({
  onChange,
  product,
  apiKey,
  bookingDivisions
}) {

  let actions = new Actions(apiKey)

  return <BigglyGetMenu
    cascaderAttr={{
      allowClear: false
    }}  
    defaultValue={
      ((product.bookingDivName || '').length > 0 && (product.bookingName || '').length > 0) &&
        product.bookingDivName + ' / ' + product.bookingName
    }
    apiKey={apiKey}
    menuOptions={[
      {
        typeDisplay: 'Booking Divisions',
          optionKey: 'bookingDivName',
          isLeaf: false,
          async get() {
            return bookingDivisions
          }
      },
        {
          typeDisplay: 'Booking Templates',
          optionKey: 'bookingName',
          isLeaf: true,
          getKeys: ['bookingDivKey'],
          async get(apiKey, bookingDivKey) {
            return await actions.getBookingTemplatesByDivKey(bookingDivKey)
          }
        },
    ]}
    menuSelectionFunction={bookingTemplate => {
      return onChange(bookingTemplate)
    }}
  />
}

export default BookingTemplateSelector
