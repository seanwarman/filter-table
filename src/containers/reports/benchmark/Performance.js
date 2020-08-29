import React from 'react'
import PageLoadMetrics from './report-renders/PageLoadMetrics.js'

function filter(targetOutputs, method) {
  return targetOutputs.filter(targetOutput => targetOutput.method === method)
}

function Performance({
  targetOutputs = [],
  className = '',
}) {

  const performanceTargs = targetOutputs.filter(targetOutput => targetOutput.category === 'Performance')

  return (
    <div className={className}>
      <h3>Performance</h3>

      <p>There are many factors that guage a page's performance. Here are some key metrics that can help to clarify how your page is performing and where improvements can be made.</p>

      <PageLoadMetrics targetOutputs={filter(performanceTargs, 'pageLoadMetrics')} />


    </div>
  )
}

export default Performance
