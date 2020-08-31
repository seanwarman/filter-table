import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import { 
  Layout
} from 'antd'

import SearchBar from './SearchBar'
import CustomFilterPanel from '../../features/custom-filter-panel/CustomFilterPanel'
import BookingsTable from '../../features/bookings-table/BookingsTable'

import './BookingsFilter.css'

const { Content } = Layout

function BookingsFilter({
  changeHeader,
  selectedRowKeys,
  drawerWidth,
}) {

  useEffect(() => {
    changeHeader('hdd', 'BookingHub', [
      { name: 'Bookings Filter', url: '/bookings-filter/bookings' }
    ])

  }, [ changeHeader ])

  return (
    <Content id="bookings-filter"
      style={{
        marginRight: selectedRowKeys.length > 0 ? drawerWidth : '0px',
        transition: 'all .3s'
      }}
    >

      <br />

      <SearchBar />

      <CustomFilterPanel />

      <BookingsTable />

    </Content>
  )

}

export default connect(
  ({ app, bookingsTable }) => ({
    drawerWidth: bookingsTable.drawerWidth,
    selectedRowKeys: bookingsTable.selectedRowKeys,
    apiKey: app.user.apiKey,
  })
)(BookingsFilter)

