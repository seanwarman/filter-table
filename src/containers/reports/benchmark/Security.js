import React from 'react'
import DescriptionAndResult from './report-renders/DescriptionAndResult.js'

function Security({
  targetOutputs = [],
  className = ''
}) {

  if(!targetOutputs) return null

  const secOutputs = targetOutputs.filter(targetOutput => targetOutput.category === 'Security')

  return (
    <div className={className}>
      <h3>Security</h3>

      {
        secOutputs.map(({ description, output }, i) => (

          <DescriptionAndResult
            description={description}
            result={output.result}
          />

        ))
      }

    </div>
  )

}

export default Security
