import React from 'react'
import {
  Tooltip,
  Icon,
  Tag
} from 'antd'
import moment from 'moment'
import colorPicker from '../../App.utils'
import {
  formatDataByKey,
  handleTotalValue,
} from './BookingsTable.utils.js'

import TaskIncomplete from './TaskIncomplete'
import TaskStatus from './TaskStatus'
import RenderFlag from './RenderFlag'

export const columns = divisions => [
  {
    title: 'Booking Name',
    dataIndex: 'bookingName',
    key: 'bookingName',
    className: 'bms--has-icons',
    render: (bookingName, record) => (
      <div>

        {decodeURIComponent(bookingName)}

        <div style={{
          position: 'absolute',
          right: 2,
          top: 4,
          height: 16,
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
          {
            (record.flags || []).length > 0 &&
              record.flags.map((flag, i) => (
                <RenderFlag key={i} flag={flag} bookingDivKey={record.bookingDivKey} />
              ))
          }
          {
            <Tooltip
              title={record.commentCount > 0 ? record.commentCount : 'None'}
            >
              <Icon
                className={record.commentCount > 0 ? 'bms--icon-alive' : 'bms--icon-dead'}
                type="message"
              />
            </Tooltip>
          }
        </div>
      </div>
    )
  },
  {
    title: 'Template Name',
    dataIndex: 'tmpName',
    key: 'tmpName',
    className: 'bms--has-tmp-name-tag',
    render: (text, record) => {
      let bookingColor = record.colorLabel ? (colorPicker('template', 'colorLabel', record.colorLabel) || {}).color : null
      return (
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: bookingColor, position: 'absolute', bottom: '0', top: '0', left: '0', right: '0' }}>
          <p style={{ padding: '16px', lineHeight: '1em', marginBottom: '0', color: '#ffffff' }}>
            {decodeURIComponent(text || '')}
          </p>
        </div>
      )
    }
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (text, record) => {
      let status = record.currentStatus
      return formatDataByKey('status', status)
    }
  },
  {
    title: 'Due Date',
    dataIndex: 'dueDate',
    key: 'dueDate',
    style: { background: 'red' },
    render: (text, record, i) => {
      // Dates and times...
      const now = moment().startOf('day')
      const dueDate = moment( record.dueDate ).startOf( 'day' )

      // Math stuff...
      const daysRemaining = dueDate.diff( now, 'days'  )
      const dueIn =  dueDate.diff( now, 'days'  )
      const daysRemainingPercentage = (8 - daysRemaining) * 5.5
      const dueDateFormat = dueDate.format( 'Do MMM' )

      // color...
      const red = '#f5222d'
      const green = '#52c41a'
      const blue = '#09a9dd'

      // Consistent style for icon...
      const iconStyle = {
        position: 'absolute',
        top: 0,
        zIndex: 1,
        bottom: 0,
        margin: 'auto',
        right: 0,
        color: '#ffffff',
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px' 
      }

      if ( record.currentStatus === 'Complete' ) { 
        return (
          <TaskStatus
            fillColor={green} 
            iconStyle={iconStyle} 
            dueDateFormat={dueDateFormat}
            icon={'like'} 
            description={'Complete'}
          ></TaskStatus>
        )
      } else {
        if ( dueIn > 0 && daysRemaining < 8 ) {
          return (
            <TaskIncomplete
              blue={blue}
              daysRemaining={daysRemaining}
              daysRemainingPercentage={daysRemainingPercentage}
              dueDateFormat={dueDateFormat}
            >
            </TaskIncomplete>
          )

        } else if ( dueIn >= 0 && dueIn <= 1 ) {
          return (
            <TaskStatus
              fillColor={red} 
              iconStyle={iconStyle} 
              dueDateFormat={dueDateFormat}
              icon={'warning'} 
              description={'Due today!'}
            ></TaskStatus>
          )
        } else if ( daysRemaining >= 8 ) {
          return (
            <TaskStatus
              dueDateFormat={dueDateFormat}
            ></TaskStatus>
          )
        } else {
          return (
            <TaskStatus
              fillColor={red} 
              iconStyle={iconStyle} 
              dueDateFormat={dueDateFormat}
              icon={'dislike'} 
              description={`Overdue by ${ Math.abs( daysRemaining ) } days` }
            ></TaskStatus>
          )
        }
      }
    }
  },
  {
    title: 'Partner Name',
    dataIndex: 'partnerName',
    key: 'partnerName',
    className: 'bms--has-tmp-name-tag',
    render: (text, record) => {
      let bookingColor = record.partnerName ? colorPicker('partner', 'value', record.partnerName).color : null
      return (
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: bookingColor, position: 'absolute', bottom: '0', top: '0', left: '0', right: '0' }}>
          <p style={{ padding: '16px', lineHeight: '1em', marginBottom: '0', color: '#ffffff' }}>
            {decodeURIComponent(record.partnerName)}
          </p>
        </div>
      )
    }
  },
  {
    title: 'Customer Name',
    dataIndex: 'customerName',
    key: 'customerName',
  },
  {
    title:
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {
          handleTotalValue('units') > 0 &&
            <span
              style={{
                width: 240,
                position: 'absolute',
                textAlign: 'center',
                top: -14,
                zIndex: 1,
              }}
            >
              <Tag
                color="#0000008c"
                style={{
                  fontSize: 11,
                }}
              >
                Total Units {handleTotalValue('units')}
              </Tag>
            </span>
        }
        Units
      </div>,
    dataIndex: 'units',
    key: 'unit',
  },
  {
    title: 'Campaign Period',
    dataIndex: 'periodKey',
    key: 'periodKey',
  },
  {
    title: 'Created By',
    dataIndex: 'createdByFullName',
    key: 'createdByFullName',
    render: (text, record, i) => (
      record.createdByFullName
    )
  },
  {
    title: 'Booking Month',
    dataIndex: 'bookingMonth',
    key: 'bookingMonth',
  },
  {
    title: 'Created Date',
    dataIndex: 'created',
    key: 'created',
    render: (text, record, i) => (
      moment(record.created).format( 'Do MMM' )
    )
  },
  {
    title: 'Assigned User',
    dataIndex: 'assignedUser',
    key: 'assignedUser',
    render: (text, record, i) => (
      record.assignedUserKey &&
      record.assignedFullName
    )
  },
  {
    title: 'Completed Date', 
    dataIndex: 'completedDate',
    key: 'completedDate',
    render: (text, record, i) => {
      if (record.completedDate) return moment(record.completedDate).format( 'Do MMM' )
    }
  }
]
