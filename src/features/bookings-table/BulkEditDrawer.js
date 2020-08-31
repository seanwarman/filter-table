import React from 'react'
import { connect } from 'react-redux'
import { 
  Drawer,
  Tabs,
  Badge,
} from 'antd'
import {
  badgeOffset
} from './BookingsTable.utils'

import colorPicker from '../../App.utils'


import { 
  selectRowKeys,
} from './BookingsTable.actions'

import BulkEdit from './BulkEdit'
import Comments from './Comments'

import './BulkEditDrawer.css'

const { TabPane: T } = Tabs

function BulkEditDrawer({
  selectRowKeys,
  bookingsFiltered,
  selectedRowKeys,
  bookingsKeys,
  drawerWidth,
}) {

  return (
    <Drawer
      id="bulkeditdrawer"
      mask={false}
      width={drawerWidth}
      onClose={() => selectRowKeys([])}
      visible={selectedRowKeys.length > 0}
    >

      <Tabs
        className="tabs"
        defaultTab="2"
      >

        <T tab="Bulk Edit" key="1"><BulkEdit /></T>
        <T tab="Comments" key="2"><Comments /></T>

        {/*
          <T tab="Uploads" key="3"><Uploads /></T>
        */}

      </Tabs>
    </Drawer>
  )

}

export default connect(({ bookingsTable }) => ({
  drawerWidth: bookingsTable.drawerWidth,
  bookingsKey: bookingsTable.bookingsKey,
  bookingsFiltered: bookingsTable.bookingsFiltered,
  selectedRowKeys: bookingsTable.selectedRowKeys,
}), {
  selectRowKeys,
})(BulkEditDrawer)
