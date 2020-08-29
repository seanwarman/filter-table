import React from 'react'
import { Select } from 'antd'

function AutoFillLabelsSelector({
  autoFillLabels,
  onChange,
}) {
  return <Select 
    defaultValue={autoFillLabels ? autoFillLabels : []}
    placeholder="Auto Fill Labels"
    mode="tags"
    style={{
      width: '200px'
    }}
    onChange={value => onChange('autoFillLabels', value)}
  >
    
    <Select.Option value="Hot Link">
      Hot Link
    </Select.Option>
    <Select.Option value="Target Keywords">
      Target Keywords
    </Select.Option>
    <Select.Option value="Citation">
      Citation
    </Select.Option>
  </Select>
}

export default AutoFillLabelsSelector
