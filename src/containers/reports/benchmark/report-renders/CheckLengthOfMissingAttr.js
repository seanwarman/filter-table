import React from 'react'
import DescriptionAndResult from './DescriptionAndResult.js'
import DetailList from './DetailList.js'

function CheckLengthOfMissingAttr({
  targetOutputs
}) {

  if(!targetOutputs) return null

  return (
    <div>
      <h4>Missing Attributes</h4>

      <p>The attribute values on your HTML content decide on how well your site is ranked on Google and other search engines.</p>

      {
        targetOutputs.map((targetOutput, i) => {

          const { output, description } = targetOutput

          if(!output) return null

          return <div key={i}>

          <DescriptionAndResult
            description={description}
            explain={output.result}
          />

          <DetailList targetOutput={targetOutput} />

        </div>
        })
      }

    </div>
  )
}

export default CheckLengthOfMissingAttr
