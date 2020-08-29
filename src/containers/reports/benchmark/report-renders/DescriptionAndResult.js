import React from 'react'
import {
  Row,
  Col
} from 'antd'
import TickOrCross from '../TickOrCross.js'
import Value from '../Value.js'

function DescriptionAndResult({
  description,
  result,
  explain
}) {

  return (
    <Row>
      <Col span={22}>
        <p>
          {description.charAt(0).toUpperCase() + description.slice(1)}
        </p>
      </Col>
      <Col span={2} style={{ textAlign: 'right' }}>
        <div style={{
          position: 'relative'
        }}>
          {
            explain ?
            <Value 
              style={{
                position: 'absolute',
                fontSize: '2rem',
                top: -16
              }} 
              value={explain} 
            />
            :
            <TickOrCross 
              style={{
                position: 'absolute',
                fontSize: '1.6rem',
                top: -10
              }} 
              condition={result} 
            />

          }


        </div>
      </Col>
    </Row>
  )
}

export default DescriptionAndResult
