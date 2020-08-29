import React from 'react'
import TableTab from './TableTab'
import BulkEditDrawer from './BulkEditDrawer'

import './BookingsTable.css'

function BookingsTable() {
  return (
    <div className="bookings-table">
      <TableTab />

      <BulkEditDrawer />
    </div>
  )
}

export default BookingsTable
