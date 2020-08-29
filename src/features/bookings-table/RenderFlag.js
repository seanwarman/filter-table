import React from 'react'
import { connect } from 'react-redux'
import { flagColor } from '../bookings-filter/BookingsFilter.utils'

function RenderFlag({
  flag,
  flags
}) {
  return (
    <div
      style={{
        backgroundColor: flagColor(flag, flags) || 'grey',
        color: 'white',
        padding: '0 4px',
        borderRadius: 5,
        fontSize: 10,
        minWidth: 44,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        marginLeft: 2,
        boxShadow: 'rgba(0, 0, 0, 0.19) 1px 1px 3px 0px',
      }}
    >{flag}</div>
  )
}

export default connect(
  ({ app }) => ({
    flags: app.flags,
  })
)(RenderFlag)
