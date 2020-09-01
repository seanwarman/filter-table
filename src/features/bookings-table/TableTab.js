import React from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Badge,
  Tabs,
  Table,
  Icon,
  Card
} from 'antd'
import colorPicker from '../../App.utils'
import {
  badgeOffset,
  filterBySearchTerm
} from './BookingsTable.utils'

import { columns } from './BookingsTable.columns.js'

import {
  selectRowKeys,
} from './BookingsTable.actions'

import './BookingsTable.css'

function TableTab({
  rowSelection,
  // functions ^^

  bookingsFiltered,
  bookingsTableLoading,
  currentTab,
  filterLoading,
  jsonFilterSelectedCount,
  selectedRowKeys,
  divisions,
  searchTerm,
  // state ^^


  selectRowKeys,

  onChangeTab,

}) {
  return (
    <Card id="bookings-table">
      <Tabs
        activeKey={currentTab}
        onChange={onChangeTab}
      >
        <Tabs.TabPane
          key={'Filter'}
          tab={
            <span>
              {
                filterLoading ?
                  <div>
                    Filter
                    <Icon
                      style={{
                        position: 'absolute',
                        right: -11,
                        top: 5
                      }}
                      type="loading"
                    />
                  </div>
                  :
                  <Badge
                    overflowCount={9999}
                    count={(bookingsFiltered || []).length}
                    offset={badgeOffset('Filter')}
                    style={{
                      backgroundColor: colorPicker('status', 'value', 'Default').color
                    }}
                  >Filter
                  </Badge>
              }
            </span>
          }
        >

          <Button
            onClick={() => selectRowKeys([])}
            disabled={selectedRowKeys.length === 0}
          >
            Deselect {
              selectedRowKeys.length > 0 &&
                `${selectedRowKeys.length} Booking${selectedRowKeys.length > 1 ? 's' : ''}`
            }
          </Button>

          <Table
            loading={bookingsTableLoading}
            rowKey="bookingsKey"
            rowSelection={{
              selectedRowKeys,
              onChange: selectedRowKeys => {
                selectRowKeys(selectedRowKeys)
              },
              // getCheckboxProps: booking => (
              //   {
              //     disabled: booking?.flags?.includes('queried') 
              //     || 
              //     booking.assignedUserKey?.length > 0
              //   }
              // )
            }}
            size="small"
            pagination={{
              size: 'small',
              showSizeChanger: true,
              position: 'both',
            }}
            columns={columns(divisions)}
            dataSource={filterBySearchTerm(searchTerm, bookingsFiltered)}
          ></Table>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  )
}

export default connect(
  ({ app, bookingsTable, customFilterPanel, bookingsFilter }) => ({
    searchTerm: bookingsFilter.searchTerm,
    jsonFilterSelectedCount: customFilterPanel.jsonFilterSelectedCount,
    bookingsFiltered: bookingsTable.bookingsFiltered,
    bookingsTableLoading: bookingsTable.bookingsTableLoading,
    currentTab: bookingsTable.currentTab,
    filterLoading: bookingsTable.filterLoading,
    divisions: app.divisions,
    selectedRowKeys: bookingsTable.selectedRowKeys,
  }),
  {
    selectRowKeys,
  }
)(TableTab)
