import React from 'react'
import DescriptionAndResult from './DescriptionAndResult.js'

function CheckNetworkForString({
  targetOutputs
}) {

  if(!targetOutputs) return null

  return (
    <div>
      <h4>Google Analytics</h4>

      <p>Google Analytics is an important tool for allowing you to better understand your customers. It measures advertising ROI as well as tracking your video and social networking sites.</p>

      {
        targetOutputs.map((targetOutput, i) => (

          <DescriptionAndResult
            key={i}
            description={targetOutput.description}
            result={targetOutput.output.result}
          />

        ))
      }

    </div>
  )
}

export default CheckNetworkForString
