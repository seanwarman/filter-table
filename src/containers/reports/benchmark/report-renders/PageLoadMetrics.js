import React from 'react'
import Metrics from '../Metrics.js'

function PageLoadMetrics({
  targetOutputs
}) {

  return (
    <div>
      <h4>Page Load Metrics</h4>

      {
        targetOutputs.map(({description: desc, ...targetOutput}, i) => (

        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <h5>{desc.charAt(0).toUpperCase() + desc.slice(1)}</h5>
          <br />
          <Metrics key={i} targetOutput={targetOutput} />
        </div>


        ))
      }


    </div>
  )
}

export default PageLoadMetrics
