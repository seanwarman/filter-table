import React from 'react'
import ListUnderlined from '../../../components/Layout/ListUnderlined.js'

const padding = '30px 30px 0 30px'

const rowStyles = {
  display: 'flex', 
  maxWidth: '310px',
  justifyContent: 'space-between' ,
  marginBottom: '6px',
  borderBottom: '1px solid #e8e8e8'
}


function ExcessUnits({
  excessUnitsByStatus,
  excessUnits
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div
        style={{ padding: padding, width: '50%' }}
      >
        <h5>Excess Units by Status</h5>

        <ListUnderlined
          styles={rowStyles}
          dataSource={excessUnitsByStatus}
          dataIndex="currentStatus"
          valueIndex="excessUnits"
        >
        </ListUnderlined>

      </div>
      <div
        style={{textAlign: 'right', padding: padding}}
      >
        Excess Units Total: <h1>{excessUnits}</h1>
      </div>
    </div>
  )
}

export default ExcessUnits
