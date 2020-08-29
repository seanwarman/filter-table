import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import {
  Divider,
  Row,
  Icon,
  Col,
} from 'antd'
import {
  fetchUploads
} from './BookingsTable.actions'

function UploadsList({
  uploads,
  selectedRowKeys,
  fetchUploads,
}) {

  useEffect(() => {
    if(selectedRowKeys.length > 0) fetchUploads(selectedRowKeys)
  }, [fetchUploads, selectedRowKeys])

  return (
    <div>
      {
        uploads.length > 0 && (
          <div style={{ paddingLeft: '5px' }}>
            <Divider />
            {
              uploads
                .reverse()
                .map((item, i) => (
                  <Row key={i} style={{ margin: '10px 0' }}>
                    <Col
                      span={12}
                      style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <Icon type="file" style={{ marginRight: '6px' }} />
                      <a
                        href={unescape(item.urlName)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {unescape(item.fileName)}
                      </a>
                    </Col>
                    <Col
                      span={12}
                      style={{
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <strong>{item.uploadedUserName}</strong> <div style={{ margin: '0 6px' }}>|</div> {moment(item.created).format('LLL')}
                    </Col>
                    <hr style={{ marginTop: '25px', marginBottom: 0 }} />
                  </Row>
                ))
            }
          </div>
        )
      }
    </div>
  )
}

export default connect(
  ({ bookingsTable }) => ({
    uploads: bookingsTable.uploads,
    selectedRowKeys: bookingsTable.selectedRowKeys,
  }),
  {
    fetchUploads
  }
)(UploadsList)
