import React from 'react'
import uuid from 'uuid'
import { Button } from 'antd'

export default function BenchmarkTableColumns({
  disabled = false,
  onClick
}) {
  return [
    {
      title: 'Name',
      dataIndex: 'siteName',
      key: 'siteName'
    },
    {
      title: 'Url',
      dataIndex: 'siteUrl',
      key: 'siteUrl'
    },
    {
      title: 'Benchmarks',
      dataIndex: 'benchmarks',
      key: uuid.v1(),
      render: benchmarks => benchmarks?.length
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '',
      dataIndex: 'customerSiteKey',
      key: 'customerSiteKey',
      render: (customerSiteKey, record) => <Button
        disabled={disabled}
        onClick={() => onClick(record)}
        type="primary"
      >Run Benchmark</Button>
    }
  ]
}
