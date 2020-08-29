import React from 'react'
import {
  score
} from './Summary.handlers.js'
import Value from './Value.js'
import { Row, Col } from 'antd'


function Summary({
  targetOutputs = [],
  className = ''
}) {

  return (
    <Row className={className} style={{ margin: '32px 0', textAlign: 'center' }}>
      <Col span={8}>
        <h5>SEO: <Value value={score('SEO', targetOutputs)} /></h5>
      </Col>
      <Col span={8}>
        <h5>Performance: <Value value={score('Performance', targetOutputs)} /></h5>
      </Col>
      <Col span={8}>
        <h5>Security: <Value value={score('Security', targetOutputs)} /></h5>
      </Col>
    </Row>
  )
}

export default Summary
