import React from 'react'
import BookingTemplateSelector from './BookingTemplateSelector.js'
import AutoFillLabelsSelector from './AutoFillLabelsSelector.js'
import { sortByAlpha } from '../Campaign.Handlers.js'

export const columns = (apiKey, bookingDivisions) => [{
    title: 'Product name',
    placeholder: 'Product name',
    dataIndex: 'productName',
    key: 'productName',
    type: 'string',
    sorter: (a,b) => sortByAlpha(a,b,'productName'),
    props: {
      width: '200px'
    }
  }, {
    title: 'Description',
    placeholder: 'Description',
    dataIndex: 'description',
    type: 'string',
    key: 'description',
    sorter: (a,b) => sortByAlpha(a,b,'description'),
    props: {
      width: '200px'
    }
  }, {
    title: 'Cost Per Unit',
    placeholder: 'Cost Per Unit',
    dataIndex: 'costPrice',
    type: 'number',
    key: 'costPrice',
    sorter: (a,b) => a.costPrice - b.costPrice,
    prefix: '£',
    props: { min: 0 }
  }, {
    title: 'Quantity',
    placeholder: 'Quantity',
    dataIndex: 'quantity',
    type: 'number',
    defaultValue: 1,
    key: 'quantity',
    sorter: (a,b) => a.quantity - b.quantity,
    prefix: ' X ',
    props: { min: 1 }
  }, {
    title: 'Total Cost',
    dataIndex: 'totalCost',
    value: 'Total Cost',
    key: 'totalCost',
    sorter: (a,b) => a.totalCost - b.totalCost,
    render: (ignore, { costPrice, quantity }, i) => (
      <TotalCost costPrice={costPrice} quantity={quantity} />
    )
  }, {
    title: 'Total Retail',
    placeholder: 'Retail',
    dataIndex: 'retailPrice',
    type: 'number',
    key: 'retailPrice',
    sorter: (a,b) => a.retailPrice - b.retailPrice,
    prefix: '£',
    props: { min: 0 }
  }, {
    title: 'Booking Template',
    placeholder: 'Booking Template',
    dataIndex: 'bookingTmpKey',
    key: 'bookingTmpKey',
    sorter: (a,b) => sortByAlpha(a,b,'bookingDivName'),
    render: (value, record, i, onChange) => {
      return ( 
      <BookingTemplateSelector 
        product={record}
        apiKey={apiKey}
        bookingDivisions={bookingDivisions}
        onChange={(record) => {
          onChange('bookingTmpKey', record.bookingTmpKey)
        }}
      />
      )
    }
  }, {
    title: 'Auto Fill Labels',
    placeholder: 'Auto Fill Labels',
    dataIndex: 'autoFillLabels',
    key: 'autoFillLabels',
    render: (autoFillLabels, product, i, onChange) => (
      <AutoFillLabelsSelector 
        autoFillLabels={autoFillLabels}
        onChange={onChange}
      />
    )
  }
]

export function TotalCost({
  costPrice,
  quantity
}) {

  return <div style={{
    position: 'relative'
  }}>
    <div
      style={{
        border: 'none',
        paddingLeft: 10,
        position: 'relative'
      }}
    >
      £{ costPrice * quantity }
    </div>
  </div>

}
