import React from 'react'
import moment from 'moment'

const padding = '30px 30px 0 30px'

function LeadDate({
  leadLag,
  date
}) {
  return <div style={{padding}}>
    <p>Lead Date:</p>

    <h2>{ moment(date).format('ddd MMM Do') }</h2>

  </div>
}

export default LeadDate
