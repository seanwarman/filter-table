import React from 'react'
import TickOrCross from '../TickOrCross.js'
import { Table } from 'antd'

const columns = [
  {
    title: 'Tag',
    key: 'tag',
    render: (text, {input}) => (
      <span>{input.type}</span>
    )
  },
  {
    title: 'Description',
    key: 'description',
    render: (text, {description}) => (
      <span>{description.charAt(0).toUpperCase() + description.slice(1)}</span>
    )
  },
  {
    render: (text, {output}) => (
      <TickOrCross condition={output.result} />
    )
  }
]

function CheckLengthOfTagContent({
  targetOutputs
}) {
  return (
    <div>

      <h4>Tag Content</h4>
      <Table
        size="small"
        dataSource={targetOutputs.map((targetOutput, i) => ({...targetOutput, key: i}))}
        columns={columns}
      ></Table>


    </div>
  )
}

export default CheckLengthOfTagContent
