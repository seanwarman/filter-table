import React from 'react'
import { Tag, Icon, message } from 'antd'
import moment from 'moment'
import colors from '../../mixins/BigglyColors'

export function convertJsonKeys(fields) {
  return Object.keys(fields).reduce((f, key) => {

    if(
      key === 'strategy'
    ) return {
      ...f,
      "$jsonForm[?Strategy].value": fields[key]
    }

    if(
      key === 'bookingMonth'
    ) return {
      ...f,
      "$jsonForm[?Booking Month].value": fields[key]
    }

    if(
      key === 'units'
    ) return {
      ...f,
      "$jsonForm[?Units].value": fields[key]
    }

    if(
      key === 'biggSpend'
    ) return {
      ...f,
      "$jsonForm[?Bigg Spend].value": fields[key]
    }

    return {
      ...f,
      [key]: fields[key]
    }

  }, {})
}

export function copyKey(bookingsKey) {
  let el = document.createElement('textarea')
  el.value = bookingsKey
  el.setAttribute('readonly', '')
  el.style = {display: 'none', "pointer-events": 'none'}
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  message.success('Bookings Key copied.')
}

export function parseDivName(bookingDivKey, divisions) {
  return divisions.find(div => div.bookingDivKey === bookingDivKey)?.bookingDivName.toLowerCase().replace(/\s\+/g, '')
}

export function badgeOffset(tab) {
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

export const formatDataByKey = (key, value) => {
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

export const renderTotalValue = (dataIndex, bookings) => {
  if(!bookings || bookings.length === 0) return 0
  return bookings.reduce((num, booking) => {
    if(booking[dataIndex]) {
      return num + Number(booking[dataIndex])
    }
    return num
  }, 0).toFixed(2)
}

export const filterBookingsByTab = (bookings, tab) => {

  if (tab && tab !== 'All') {
    bookings = bookings.filter(booking => booking.currentStatus === tab)
  }

  if (tab === 'All') {
    bookings = bookings.filter(booking => booking.currentStatus !== 'Complete')
  }

  return bookings
}

export const handleTotalValue = (dataIndex) => {
  return 0

//   const { bookingsFiltered, bookingsSearched, bookings, currentTab } = this.state

//   if(currentTab === 'Filter') {
//     return renderTotalValue(dataIndex, bookingsFiltered) 
//   }
//   if(currentTab === 'Search') {
//     return renderTotalValue(dataIndex, bookingsSearched)
//   }

//   return renderTotalValue(dataIndex, filterBookingsByTab(bookings, currentTab))
}

