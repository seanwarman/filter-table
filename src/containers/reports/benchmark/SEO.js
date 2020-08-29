import React from 'react'
import CheckNumberOfTags from './report-renders/CheckNumberOfTags.js'
import CheckLengthOfTagContent from './report-renders/CheckLengthOfTagContent.js'
import CheckForTargetKeywords from './report-renders/CheckForTargetKeywords.js'
import CheckGrammar from './report-renders/CheckGrammar.js'
import CheckLengthOfMissingAttr from './report-renders/CheckLengthOfMissingAttr.js'
import IsSiteIndexed from './report-renders/IsSiteIndexed.js'
import CheckNetworkForString from './report-renders/CheckNetworkForString.js'

function filter(targetOutputs, method) {
  return targetOutputs.filter(targetOutput => targetOutput.method === method)
}

function SEO({
  targetOutputs = [],
  className = ''
}) {

  const seoOutputs = targetOutputs.filter(targetOutput => targetOutput.category === 'SEO')

  return (
    <div className={className}>
      <h3>SEO</h3>

      <IsSiteIndexed targetOutputs={filter(seoOutputs, 'isSiteIndexed')} />
      <CheckNetworkForString targetOutputs={filter(seoOutputs, 'checkNetworkForString')} />
      <CheckNumberOfTags targetOutputs={filter(seoOutputs, 'checkNumberOfTags')} />
      <CheckLengthOfTagContent targetOutputs={filter(seoOutputs, 'checkLengthOfTagContent')} />
      <CheckGrammar targetOutputs={filter(seoOutputs, 'checkGrammar')} />
      <CheckForTargetKeywords targetOutputs={filter(seoOutputs, 'checkForTargetKeywords')} />
      <CheckLengthOfMissingAttr targetOutputs={filter(seoOutputs, 'checkLengthOfMissingAttr')} />

    </div>
  )
}

export default SEO
