import React from 'react'

function Value({
  style,
  value
}) {

  return (
    <span style={{color: '#2baae0', ...style}}>{value}</span>
  )

}

export default Value
