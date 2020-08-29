import React from 'react'
import { Button, Select } from 'antd';
import BigglyGetMenu from '../../../components/BigglyGetMenu'
import { sortByAlpha } from '../Campaign.Handlers.js'

export const adderColumns = (apiKey, history, campaignDivisions) => {
  return [
    ...columns(apiKey, history, campaignDivisions)
  ]
}

export const updaterColumns = (apiKey, history, campaignDivisions) => {
  return [
    ...columns(apiKey, history, campaignDivisions),
    {
      render: (value, record) => 
      <Button 
        style={{ margin: 0, padding: 0 }}
        onClick={() => history.push(`/campaign-hub/packages/${record.packageKey}`)}
        type="link"
      >
        Edit
      </Button>
    }
  ]
}

export const columns = (apiKey, history, campaignDivisions) => {

  return [
    {
      title: 'Package Name',
      placeholder: 'Package Name',
      dataIndex: 'packageName',
      key: 'packageName',
      type: 'string',
      sorter: (a,b) => sortByAlpha(a,b,'packageName')
    }, 
    {
      title: 'Campaign Division',
      dataIndex: 'campaignDivKey',
      key: 'campaignDivKey',
      sorter: (a,b) => sortByAlpha(a,b,'campaignDivName'),
      render: (value, record, i, onChange) => {
        return <BigglyGetMenu
          cascaderAttr={{
            allowClear: false,
            onChange: () => console.log('changing'),
            placeholder: 'Campaign Division'
          }}  
          defaultValue={record.campaignDivName}
          apiKey={apiKey}
          menuOptions={[
            {
              typeDisplay: 'Campaign Division',
                optionKey: 'campaignDivName',
                isLeaf: true,
                async get(apiKey) {
                  return campaignDivisions
                }
            }
          ]}
          menuSelectionFunction={option => {
            onChange('campaignDivKey', option.campaignDivKey, i)
            return
          }}
        />
      }
    }, 
    {
      title: 'Frequency',
      placeholder: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      sorter: (a,b) => sortByAlpha(a,b,'frequency'),
      render: (value, record, i, onChange) => {
        return (
          <Select
            size="small"
            style={{width: 140}}
            onChange={option => onChange('frequency', option, i)}
            defaultValue={value}
          >
            <Select.Option value="Monthly">
              Monthly
            </Select.Option>
            <Select.Option value="Weekly">
              Weekly
            </Select.Option>
          </Select>
        )
      }
    }
  ]
}


