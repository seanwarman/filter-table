import React from 'react'

function LeadLag({
  leadLag
}) {


  const style = {         // red      green
    color: leadLag > -1 ? '#f4705b' : '#59c57f'
  }

  return <div style={style}>
    {leadLag}
  </div>
}

export default LeadLag
