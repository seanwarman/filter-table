import React from 'react'
import {
  Row,
  Col
} from 'antd'

export default function DefaultTargets({
  target,
  children: inputs,
  ...props
}) {

  const { style = {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: '1px solid #cdcdcd96'
  } } = props

  return (

  <div {...props} style={style}>

    <h4>Rule</h4>
    <p>{target.description}</p>

    <Row gutter={16}>

      {
        React.Children.map(inputs, child => (
          <Col span={6}>
            {
              React.cloneElement(child)
            }
          </Col>
        ))
      }

    </Row>

  </div>

  )

}


