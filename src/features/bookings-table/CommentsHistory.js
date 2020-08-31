import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { 
  Icon,
} from 'antd'

const bookingNameStyles = {
  position: 'absolute',
  borderRadius: '5px',
  backgroundColor: '#488eff',
  // backgroundColor: '#0dc48a',
  right: 0,
  top: 3,
  color: 'white',
  padding: '0 7px',
  fontSize: 10
}

function CommentsHistory({
  comments = [],
  fetchingComments = true,
}) {
  return (
    comments.length > 0 &&
    comments.map((record, i) => (
      <div key={i} style={{ position: 'relative' }} >

        {/*
          record.flagged === 'queried' &&
          <div style={bookingNameStyles}
          >Query</div>
        */}

        <div
          style={bookingNameStyles}
        >{decodeURIComponent(record.bookingName)}</div>
        <span style={{ fontSize: '1rem' }}>
          <Icon type="user" />{' '}
          <b>
            {record.firstName} {record.lastName}
          </b>
        </span>
        <p style={{ padding: 7, marginBottom: 5 }}>{decodeURIComponent(record.comment)}</p>
        <div style={{ fontSize: 10, textAlign: 'right' }}>
          {
            record.created ?
              moment(record.created).format('lll')
              :
              <Icon type="loading" />
          }
        </div>
        <hr />
      </div>
    ))
  )
}

export default connect(
  ({ bookingsTable }) => ({
    comments: bookingsTable.comments,
    fetchingComments: bookingsTable.fetchingComments,
  })
)(CommentsHistory)
