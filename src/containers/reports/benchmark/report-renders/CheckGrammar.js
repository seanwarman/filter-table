import React from 'react'
import CheckGrammarRule from './CheckGrammarRule.js'

function CheckGrammar({
 targetOutputs
}) {

  return (
    <div>
      <h4>Grammar</h4>

      <p>The meta description on your webpage should have general good grammar. This is somethign important for a good SEO score from Google.</p>

      {
        targetOutputs.map((targetOutput, i) => (

          <CheckGrammarRule targetOutput={targetOutput} key={i} />

        ))
      }
    </div>


  )

}

export default CheckGrammar
