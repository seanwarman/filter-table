import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import {
  Drawer
} from 'antd'
import {
  basePath
} from './Benchmarks.handlers.js'
import TestResults from './TestResults.js'


function BenchmarkDrawer({
  benchmark = {},
  onClose = () => {},
  match,
  history,
}) {

  function onCloseDrawer() {

    const { page, customerSiteKey } = match.params

    history.push(`${basePath}/${page}/${customerSiteKey}`)

    onClose()

  }


  const {
    benchmarksKey, 
    benchmarkName 
  } = benchmark

  return (

    <Drawer
      onClose={onCloseDrawer}
      width={620}
      visible={benchmarksKey ? true : false}
    >
      <p>{benchmarkName}</p>
      <br />
      <Link
        to={'/reports/benchmark/' + benchmarksKey}
      >View Report</Link>


      <h3>Browser Benchmarks</h3>

      <TestResults
        benchmarks={benchmark.browserBenchmarks}
      >
      </TestResults>

      <br />
      <br />

      <h3>Page Benchmarks</h3>

      <TestResults
        benchmarks={benchmark.pageBenchmarks}
      >
      </TestResults>


    </Drawer>

  )

}

export default withRouter(BenchmarkDrawer)
