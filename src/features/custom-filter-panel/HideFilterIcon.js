import React from 'react'
import { connect } from 'react-redux'
import { 
  Icon, 
  Row, 
  Col, 
} from 'antd'

import {
  hideFilter,
} from './CustomFilterPanel.actions.js'

function HideFilterIcon({
  onHideFilter,
  hideFilter
}) {
  return (
    <Row
      style={{
        position: 'absolute',
        bottom: 10,
        width: '100%',
      }}
    >
      <Col
        span={24}
        style={{ textAlign: 'center' }}
      >
        {
          hideFilter ?
            <Icon 
              style={{color: '#d4d4d4', fontSize: 20}}
              onClick={onHideFilter}
              type="down"
            />
            :
            <Icon 
              style={{color: '#d4d4d4', fontSize: 20}}
              onClick={onHideFilter}
              type="up"
            />
        }
      </Col>
    </Row>
  )
}

export default connect(
  ({ customFilterPanel }) => ({
    hideFilter: customFilterPanel.hideFilter,
  }),
  {
    onHideFilter: hideFilter
  }
)(HideFilterIcon)
