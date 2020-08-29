import React from 'react'
import { Table } from 'antd'
import Value from '../Value.js'

const columns = [
  {
    title: 'Keywords',
    key: 'keyword',
    dataIndex: 'keyword'
  },
  {
    title: 'Count',
    key: 'count',
    dataIndex: 'count',
    render: val => (
      <Value value={!val ? '0' : val} />
    )
  }
]

function CheckForTargetKeywords({
  targetOutputs
}) {

  if(!targetOutputs[0]) return null

  return (
    <div>
      <h4>Target Keywords</h4>

      {
        targetOutputs.map((targetOutput, i) => { 

          const {
            description = '',
            output
          } = targetOutput

          if(!output) return null

          const keywords = Object.keys(output.result).map((keyword, i) => ({ keyword, count: output[keyword], key: i }))

          return <span key={i}>
            <p>{description.charAt(0).toUpperCase() + description.slice(1)}</p>

            <Table
              size="small"
              dataSource={keywords}
              columns={columns}
            />
          </span>

        })
      }


    </div>
  )
}

export default CheckForTargetKeywords
