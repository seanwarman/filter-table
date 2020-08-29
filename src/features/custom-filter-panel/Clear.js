import React from 'react'
import {
  Row
} from 'antd'

export default function Clear({
  onClick
}) {
  return (
    <Row>
      <div
        onClick={onClick}
        style={{
          cursor: 'pointer',
          marginTop: 16,
          textAlign: 'right',
          color: '#2baae0',
          textDecoration: 'underline',
          position: 'absolute',
          right: 0,
          zIndex: 1
        }}
      >Clear</div>
    </Row>
  )
}
