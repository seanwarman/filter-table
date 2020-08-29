import React from 'react'
import { 
  Empty,
  Badge, 
  Tabs, 
  Table, 
  Icon, 
} from 'antd'
import colorPicker from '../../libs/bigglyStatusColorPicker'

function badgeOffset(tab) { 
  return (
    tab === 'Complete' ||
    tab === 'Draft' ||
    tab === 'Live' ||
    tab === 'All' ?
    [25, -5]
    :
    [15, -5]
  ) 
}


export default function FilteredBookingsTable({
  rowSelection,
  // functions ^^

  bookings, 
  bookingsFiltered,
  bookingsTableLoading,
  currentTab,
  filterLoading,
  jsonFilterSelectedCount, 
  rowSelectionState,
  // state ^^

  onChangeTab,
  columns,

}) {
    return (

      (jsonFilterSelectedCount === 0 || !jsonFilterSelectedCount) ?
      <Empty style={{marginTop: '130px'}} />
      :
      <Tabs
        activeKey={currentTab}
        onChange={onChangeTab}
      >
        {
          (jsonFilterSelectedCount > 0 || filterLoading) &&
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
              <Table
                loading={bookingsTableLoading}
                rowKey="bookingsKey"
                rowSelection={
                  rowSelectionState ?
                    rowSelection()
                    :
                    null
                }
                size="small"
                pagination={{
                  size: 'small',
                  showSizeChanger: true,
                  position: 'both',
                }}
                columns={columns}
                dataSource={bookingsFiltered}
              ></Table>
            </Tabs.TabPane>

        }
        
      </Tabs>
    )
  }


