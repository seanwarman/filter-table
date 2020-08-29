import React, { Fragment } from 'react'
import { 
  Icon, 
  Tag, 
  Tooltip, 
} from 'antd'
import { Link } from 'react-router-dom'
import moment from 'moment'
import colorPicker from '../../libs/bigglyStatusColorPicker'
import colors from '../../mixins/BigglyColors'

const iconStyle = color => ({
  position: 'absolute',
  top: 0,
  zIndex: 1,
  bottom: 0,
  margin: 'auto',
  right: 0,
  color: color ? color : '#ffffff',
  left: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px' 
})

function divisionIcon(icon) {
  return (
    <div style={{
      position: 'relative'
    }}>
      <svg style={{
        display: 'block',
        margin: '10px auto',
        width: '30px',
        height: '30px'
      }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle fill={'#00000000'} cx="50" cy="50" r="35"/>
      </svg>
      <Tooltip placement="top">
        <Icon style={ iconStyle('#000000a6') } type={ icon } />
      </Tooltip>
    </div>
  )
}

function tasksStatus( fillColor, icon, description ) {
  return (
    <div style={{
      position: 'relative'
    }}>
      <svg style={{
        display: 'block',
        margin: '10px auto',
        width: '30px',
        height: '30px'
      }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle fill={ fillColor } cx="50" cy="50" r="35"/>
      </svg>
      <Tooltip placement="top" title={ description }>
        <Icon style={ iconStyle() } type={ icon } />
      </Tooltip>
    </div>
  )
}

function taskIncomplete( fillColor, daysRemaining, percentage ) {
  return (
    <Tooltip placement="top" title={`${ typeof daysRemaining === 'number' ? daysRemaining : 'unknown' } days remaining`}>
      <svg style={{
        display: 'block',
        margin: '10px auto', 
        width: '20px',
        height: '20px'
      }} viewBox="0 0 16 16" stroke={ fillColor } className="circular-chart">
        <path style={{
          fill: 'none',
          stroke: '#eeeeee',
          strokeWidth: '2.9'
        }} className="circle-bg"
          d="M8 1
          a 7 7 0 0 1 0 14
          a 7 7 0 0 1 0 -14"
        />
        <path style={{
          fill: 'none',
          strokeLinecap: 'round'
        }} className="circle"
          strokeWidth="1.9"
          strokeDasharray={ `${ percentage }, 44` } 
          d="M8 1
          a 7 7 0 0 1 0 14
          a 7 7 0 0 1 0 -14"
        />
      </svg>
    </Tooltip>
  )
}

function sortByNumberOrAlpha(a, b, key, type) {
  if (type === 'string') {
    let A = JSON.stringify(a[key]).toUpperCase()
    let B = JSON.stringify(b[key]).toUpperCase()
    return A === B ? 0 : A < B ? -1 : 1
  } else if (type === 'number') {
    return Number(a[key]) - Number(b[key])
  } else {
    console.log('Not a recognised type: ', key)
  }
}


function formatDataByKey(key, value) {
  if (!value) return null

  if (key === 'created' || key === 'dueDate') {
    value = new moment(value).format('ll')
  }

  if (key === 'status') {
    let statusObj = colors.status.find(item => (
      item.value === value ?
      item
      :
      item.value === 'Default' &&
      item
    ))
    value = <Tag color={statusObj.colorLabel}><Icon type={statusObj.icon} /> {value}</Tag>
  }

  return value
}

export default function makeColumns({
  handleOpenBookingTabDrawer,
  renderFlag,
  handleTotalValue,
}) {
  return [
    {
      title: 'Booking Name',
      dataIndex: 'bookingName',
      key: 'bookingName',
      className: 'bms--has-icons',
      render: (text, record) => (
        <div>
          <Link
            to={`/${record.bookingDivName}/bookings/booking/${record.bookingsKey}`}
          >
            {decodeURIComponent(text)}
          </Link>
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
                  renderFlag(flag, record.bookingDivKey, i)
                ))
            }
            {
              <Tooltip
                title={record.uploadsCount > 0 ? record.uploadsCount : 'None'}
              >
                <Icon
                  onClick={() => handleOpenBookingTabDrawer(record)}
                  className={record.uploadsCount > 0 ? 'bms--icon-alive' : 'bms--icon-dead'}
                  type="paper-clip"
                />
              </Tooltip>
            }
            {
              <Tooltip
                title={record.commentCount > 0 ? record.commentCount : 'None'}
              >
                <Icon
                  onClick={() => handleOpenBookingTabDrawer(record)}
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
      title: 'Division',
      dataIndex: 'bookingDivName',
      key: 'bookingDivName',
      render: (text, record) => (
        <Fragment>
          <div style={{
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '80px',
            whiteSpace: 'nowrap'
          }}>
            { divisionIcon(record.icon) }
            <span>
              &nbsp;{ text }
            </span>
          </div>
        </Fragment>
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
      title: 'Strategy',
      dataIndex: 'strategy',
      key: 'strategy',
      className: 'bms--has-tmp-name-tag',
      render: (text, record) => {
        let bookingColor = record.strategy ? colorPicker('strategy', 'value', record.strategy).color : ''
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
        if ( record.currentStatus === 'Complete' ) { 
          return (
            <Fragment>
              <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '80px',
                whiteSpace: 'nowrap'
              }}>
                { tasksStatus( green, 'like', `Complete` ) }
                <span>
                  &nbsp;{ dueDateFormat }
                </span>
              </div>
            </Fragment>
          )
        } else {
          if ( dueIn > 0 && daysRemaining < 8 ) {
            return (
              <Fragment>
                <div style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '80px',
                  whiteSpace: 'nowrap'
                }}>
                  { taskIncomplete( blue, daysRemaining, daysRemainingPercentage ) }
                  <span>
                    &nbsp;{ dueDateFormat } 
                  </span>
                </div>
              </Fragment>
            )

          } else if ( dueIn >= 0 && dueIn <= 1 ) {
            return (
              <Fragment>
                <div style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '80px',
                  whiteSpace: 'nowrap'
                }}>
                  { tasksStatus( red, 'warning', `Due today!` ) }
                  <span>
                    &nbsp;{ dueDateFormat }
                  </span>
                </div>
              </Fragment>
            )
          } else if ( daysRemaining >= 8 ) {
            return (
              <Fragment>
                <div style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '80px',
                  whiteSpace: 'nowrap'

                }}>


                  { dueDateFormat }

                </div>
              </Fragment>
            )
          } else {
            return (
              <Fragment>
                <div style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '80px',
                  whiteSpace: 'nowrap'
                }}>
                  { tasksStatus( red, 'dislike', `Overdue by ${ Math.abs( daysRemaining ) } days` ) }
                  <span>
                    &nbsp;{ dueDateFormat }
                  </span>
                </div>
              </Fragment>
            )
          }
        }
      }
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
            handleTotalValue('biggSpend') > 0 &&
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
                  Total Spend £{handleTotalValue('biggSpend')}
                </Tag>
              </span>
          }
          Bigg Spend
        </div>,
      dataIndex: 'biggSpend',
      key: 'biggSpend',
      render: val => <div>£{val}</div>
    },
    {
      title: 'Partner Name',
      dataIndex: 'partnerName',
      // width: 130,
      key: 'partnerName',
      className: 'bms--has-tmp-name-tag',
      // sorter: (a, b) => sortByNumberOrAlpha(a, b, 'partnerName', 'string'),
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
}
