import React from 'react'

function renderFunctionOrPlainValue(value) {
  return function({ item }) {
    if(typeof value === 'function') {
      return value(item)
    }

    if(!value) return undefined

    return item[value]

  }
}

function ExcessList({
  dataSource,
  dataIndex,
  valueIndex,
  styles = {},
  ...props
}) { 

  const rowStyles = {
    display: 'flex', 
    justifyContent: 'space-between' ,
    marginBottom: '6px',
    borderBottom: '1px solid #e8e8e8',
    ...styles
  }

  let DataIndex = renderFunctionOrPlainValue(dataIndex)
  let ValueIndex = renderFunctionOrPlainValue(valueIndex)

  return (
    dataSource.map((item, i) => (

      <div key={i} style={rowStyles} {...props}>

        {
          dataIndex && 
          <b><DataIndex
            item={item}
          /></b>
        }

        <ValueIndex item={item} />
      </div>

    ))
  )
}

export default ExcessList
