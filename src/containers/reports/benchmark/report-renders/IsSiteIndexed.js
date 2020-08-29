import React from 'react'
import DescriptionAndResult from './DescriptionAndResult.js'

function IsSiteIndexed({
  targetOutputs = []
}) {

  if(!targetOutputs[0]) return null

  return (
    <div>
      <h4>Site Index</h4>

      {
        targetOutputs.map((targetOutput, i) => (

          targetOutput.output?.result &&

          <DescriptionAndResult
            key={i}
            description="A site index is the value we use to determine whether Google and other search engines are listing the website."
            result={targetOutput.output.result}
          />

        ))
      }

      

    </div>
  )
}

export default IsSiteIndexed
