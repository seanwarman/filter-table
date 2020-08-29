import React from 'react'
import {
  Table
} from 'antd'
import Value from '../Value.js'

const columns = [
  {
    title: 'Tag',
    key: 'tag',
    render: (text, targetObject) => (
      <span>{targetObject.input.type}</span>
    )
  },
  {
    title: 'Frequency',
    key: 'frequency',
    render: (text, targetObject) => (
      <Value value={targetObject.output.result} />
    )
  }
]

function CheckNumberOfTags({
  targetOutputs,
  key
}) {
  return (
    <div key={key}>
      <h4>Number of Tags</h4>
      <p>HTML header tags are an important way of signaling to search engines the important contenttopics of your page, and subsequently the keywords it should rank for.</p>

      <Table
        size="small"
        dataSource={targetOutputs.map((target, i) => ({...target, key: i}))}
        columns={columns}
      ></Table>
    </div>
  )
}

export default CheckNumberOfTags
