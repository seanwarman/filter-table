import React from 'react'
import ConvertOutputDetail from './ConvertOutputDetail.js'
import ConvertOutputResult from './ConvertOutputResult.js'
import {
  Card
} from 'antd'

export default function TestResults({
  benchmarks
}) {

  const style = {
    margin: '8px 0'
  }

  const detail = {
    maxWidth: '507px',
    overflow: 'hidden'
  }

  const label = {
    marginBottom: '8px'
  }

  return (
    benchmarks?.map(({
      output = {result: {}},
      input = {},
      description = ''
    }, i) => 

    <Card style={style} key={i}>
      <h5>{description}</h5>
      <div style={{marginBottom: '1em'}}>
        <code>{ConvertOutputDetail({ detail: input })}</code>
        <hr />
        <div> <div style={label}>Result:</div> {ConvertOutputResult({ result: output.result })}</div>
        {
          output.detail &&
          <>
            <hr />
            <div style={detail}> <div style={label}>Detail:</div> <i>{ConvertOutputDetail({ detail: output.detail })}</i></div>
          </>
        }
        </div>
      </Card>

    ) || null
  )
}


