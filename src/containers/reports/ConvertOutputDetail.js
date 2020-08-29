import React from 'react'

export default function ConvertOutputDetail({
  detail
}) {
  if(!detail && detail !== 0) return null

  const style = {
    height: '24px',
    overflow: 'hidden'
  }

  if(detail instanceof Array) return detail.map((item, i) => 
    <div style={style} key={i}>{ConvertOutputDetail({ detail: item })}</div>
  )

  if(detail instanceof Object) return Object.keys(detail).map((key, i) => 
    <div style={{display: 'flex'}} key={i}>
      <b>{key}</b>: &nbsp; <i>{ConvertOutputDetail({  detail: detail[key] })}</i>
    </div>
  )

  if(typeof detail === 'string') {
    try {
      return ConvertOutputDetail({ detail: JSON.parse(detail) })
    } catch (err) {
      return <div style={style}>{JSON.stringify(detail)}<br /></div>
    }
  }

  return <div style={style}>{JSON.stringify(detail)}<br /></div>
}


