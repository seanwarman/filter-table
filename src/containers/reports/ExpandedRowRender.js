import React from 'react'
import { withRouter } from 'react-router-dom'
import ListUnderlined from '../../components/Layout/ListUnderlined.js'
import {
  Button
} from 'antd'
import moment from 'moment'
import {
  sortBenchmarks,
  onClickLink
} from './Benchmarks.handlers.js'

function ExpandedRowRender({
  match,
  history,
  record,
  setBenchmarkToProps
}) {
  return (
    record.benchmarks &&
    <ListUnderlined
      dataSource={sortBenchmarks(record.benchmarks)}
      dataIndex={benchmark => { 

        const { page, customerSiteKey } = match.params
        const { benchmarksKey } = benchmark

        return <Button
          type="link"
          onClick={() => onClickLink({
            page, 
            customerSiteKey, 
            benchmarksKey,
            history: history,
            callback: setBenchmarkToProps
          })}
        >{benchmark.benchmarkName}</Button>


      }}
      valueIndex={benchmark => (
        moment(benchmark.created).format('ddd MMM Do')
      )}
    >
    </ListUnderlined>
  )
}

export default withRouter(ExpandedRowRender)
