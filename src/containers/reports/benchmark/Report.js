import React from 'react'
import { withRouter } from 'react-router-dom'
import { Skeleton } from 'antd'

import Summary from './Summary.js'
import SEO from './SEO.js'
import Usability from './Usability.js'
import Performance from './Performance.js'
import Security from './Security.js'
import Value from './Value.js'

import './Report.css'

function Report({
  benchmark = {},
}) {

  const {
    browserBenchmarks = [], 
    pageBenchmarks = [],
    benchmarkName = ''
  } = benchmark

  // Merge both of the outputs, they're the same format so work in
  // the same way.
  const targetOutputs = [ ...pageBenchmarks, ...browserBenchmarks ]

  return (
    benchmark ?

    <div id="report">
      <h1>Report</h1>

      <p>
        <b>{benchmarkName}</b>
      </p>

      <p>
        This report grades your website on the strength of a range of important factors such as on-page SEOoptimization, off-page backlinks, social, performance, security and more. The overall grade is on a A+ to F-scale, with most major industry leading websites in the A range. Improving a website's grade isrecommended to ensure a better website experience for your users and improved ranking and visibility bysearch engines.
      </p>

      <Summary className="section" targetOutputs={targetOutputs} />

      <Performance className="section" targetOutputs={targetOutputs} />
      <Security className="section" targetOutputs={targetOutputs} />
      <SEO className="section" targetOutputs={targetOutputs} />



      {/*
        We don't have any target rules set up for usability, this could be added in
        if requested.
        <Usability targetOutputs={targetOutputs} />
      */}


    </div>
    :
    <Skeleton paragraph={{rows: 9}} />

  )
}

export default withRouter(Report)
