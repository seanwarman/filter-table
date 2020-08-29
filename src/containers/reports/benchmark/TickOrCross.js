import React from 'react'

function TickOrCross({
  condition,
  style = {}
}) {

  // if(typeof condition !== 'boolean') return null
  return (

    condition ?
    <span style={{color: '#73d13d', ...style}}>&#10003;</span>
    :
    <span style={{color: '#fa541c', ...style}}>X</span>

  )
}

export default TickOrCross
