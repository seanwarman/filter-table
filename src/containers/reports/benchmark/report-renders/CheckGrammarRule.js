import React from 'react'
import DescriptionAndResult from './DescriptionAndResult.js'

function CheckGrammarRule({
  targetOutput
}) {
  if(!targetOutput) return null

  const {
    output,
    description
  } = targetOutput

  return (
    <div>
      <h5>Rule</h5>
      <p>{description.charAt(0).toUpperCase() + description.slice(1)}</p>

      <DescriptionAndResult
        description={`"${decodeURIComponent(output.detail.text)}"`}
        result={output.result}
      />

    </div>
  )
}

export default CheckGrammarRule
